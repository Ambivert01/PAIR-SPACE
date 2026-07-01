/**
 * ChatPageUltra Component
 *
 * Premium chat experience with ultra smooth animations and emotional design
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getChatSocket, resetChatSocket } from "../socket/chatSocket.js";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { usePresence } from "../features/presence/usePresence.js";
import { analyzeText } from "../features/ai/aiService.js";
import api from "../services/api.js";
import ChatHeaderUltra from "../features/chat/ChatHeaderUltra.jsx";
import MessageListUltra from "../features/chat/MessageListUltra.jsx";
import MessageInputUltra from "../features/chat/MessageInputUltra.jsx";
import TypingIndicatorUltra from "../features/chat/TypingIndicatorUltra.jsx";
import EmotionBadge from "../features/ai/EmotionBadge.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import { useSyncContext } from "../features/offline/SyncProvider.jsx";
import { fadeIn } from "../utils/motionPresets.js";

export default function ChatPageUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading } = useRelationship();

  const [messages, setMessages] = useState([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [typingType, setTypingType] = useState("text");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const typingTimeout = useRef(null);
  const emotionTimer = useRef(null);
  const socketRef = useRef(null);

  const { isOnline, enqueue } = useSyncContext() || {};
  const { partnerPresence, setStatus } = usePresence(rel?.id);

  const updateMessage = (id, patch) =>
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, ...patch } : m)),
    );

  // Redirect if no active relationship (relationship itself comes from shared context now)
  useEffect(() => {
    if (!relLoading && (!rel || rel.status !== "active")) {
      navigate("/invite", { replace: true });
    }
  }, [relLoading, rel, navigate]);

  useEffect(() => {
    if (!rel?.id || rel.status !== "active") return;
    let mounted = true;

    const init = async () => {
      try {
        setMessagesLoading(true);
        const { data } = await api.get(`/api/chat/messages/${rel.id}?limit=30`);
        if (mounted) {
          setMessages(data.messages);
          setNextCursor(data.nextCursor);
          setMessagesLoading(false);
        }

        const socket = getChatSocket();
        socketRef.current = socket;
        socket.auth = { token: localStorage.getItem("pairspace_token") };
        socket.connect();

        socket.on("connect", () => {
          setConnected(true);
          socket.emit("join_relationship_room", { relationshipId: rel.id });
        });
        socket.on("disconnect", () => setConnected(false));
        socket.on("receive_message", (msg) => {
          setMessages((prev) =>
            prev.find((m) => m._id === msg._id) ? prev : [...prev, msg],
          );
        });
        socket.on("message_updated", ({ messageId, content, edited }) =>
          updateMessage(messageId, { content, edited }),
        );
        socket.on("message_deleted", ({ messageId }) =>
          updateMessage(messageId, { deleted: true, content: "" }),
        );
        socket.on("reaction_updated", ({ messageId, reactions }) =>
          updateMessage(messageId, { reactions }),
        );
        socket.on("typing_start", ({ typingType: tt = "text" }) => {
          setTypingType(tt);
          setPartnerTyping(true);
          clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setPartnerTyping(false), 3000);
        });
        socket.on("typing_stop", () => {
          clearTimeout(typingTimeout.current);
          setPartnerTyping(false);
        });
        socket.on("message_status_update", ({ messageId, status }) =>
          updateMessage(messageId, { status }),
        );
        socket.on("error", ({ message: msg }) => setError(msg));
      } catch (err) {
        setMessagesLoading(false);
        if (err.response?.status === 404) navigate("/invite", { replace: true });
        else setError("Failed to load chat");
      }
    };

    init();
    return () => {
      mounted = false;
      clearTimeout(typingTimeout.current);
      clearTimeout(emotionTimer.current);
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("receive_message");
        socketRef.current.off("message_updated");
        socketRef.current.off("message_deleted");
        socketRef.current.off("reaction_updated");
        socketRef.current.off("typing_start");
        socketRef.current.off("typing_stop");
        socketRef.current.off("message_status_update");
        socketRef.current.off("error");
      }
      resetChatSocket();
    };
  }, [rel?.id, rel?.status, navigate]);

  const handleSend = ({ content, replyToMessageId, editMessageId }) => {
    if (!rel) return;
    setCurrentEmotion(null);

    if (editMessageId) {
      socketRef.current?.emit("message_edit", {
        messageId: editMessageId,
        content,
        relationshipId: rel.id,
      });
      setEditMessage(null);
      return;
    }

    // Optimistic local echo — message appears immediately, replaced/reconciled
    // when the server's `receive_message` event arrives (matched by content +
    // temp id removal), so sending never feels delayed even on a slow connection.
    const optimisticId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: optimisticId,
      content,
      type: "text",
      senderId: currentUserId,
      status: connected && isOnline ? "sending" : "queued",
      createdAt: new Date().toISOString(),
      relationshipId: rel.id,
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // If offline or socket disconnected — enqueue for later sync
    if (!connected || !isOnline) {
      enqueue?.({
        actionType: "message_send",
        entityType: "message",
        payload: {
          content,
          type: "text",
          ...(replyToMessageId && { replyToMessageId }),
        },
        relationshipId: rel.id,
      });
      setReplyTo(null);
      return;
    }

    socketRef.current?.emit("send_message", {
      relationshipId: rel.id,
      content,
      type: "text",
      ...(replyToMessageId && { replyToMessageId }),
    });
    // Drop the optimistic echo once the real message round-trips back via socket
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
    }, 4000);
    setReplyTo(null);
  };

  const handleTypingStart = () =>
    socketRef.current?.emit("typing_start", { relationshipId: rel?.id });

  const handleTypingStop = (text) => {
    socketRef.current?.emit("typing_stop", { relationshipId: rel?.id });
    clearTimeout(emotionTimer.current);
    if (text?.trim().length > 8) {
      emotionTimer.current = setTimeout(async () => {
        try {
          const result = await analyzeText(text);
          setCurrentEmotion(result.emotion !== "neutral" ? result : null);
        } catch {
          setCurrentEmotion(null);
        }
      }, 800);
    } else {
      setCurrentEmotion(null);
    }
  };

  const handleDelete = (messageId) => setDeleteTarget(messageId);

  const confirmDelete = () => {
    socketRef.current?.emit("message_delete", {
      messageId: deleteTarget,
      relationshipId: rel?.id,
    });
    setDeleteTarget(null);
  };

  const handleReact = (messageId, emoji) =>
    socketRef.current?.emit("reaction_add", { messageId, emoji, relationshipId: rel?.id });

  const handleRemoveReaction = (messageId) =>
    socketRef.current?.emit("reaction_remove", { messageId, relationshipId: rel?.id });

  const handleLoadOlder = async () => {
    if (!nextCursor || loadingOlder || !rel) return;
    setLoadingOlder(true);
    try {
      const { data } = await api.get(`/api/chat/messages/${rel.id}?limit=30&cursor=${nextCursor}`);
      setMessages((prev) => [...data.messages, ...prev]);
      setNextCursor(data.nextCursor);
    } catch {
      /* silent */
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleMessageVisible = (messageId) =>
    socketRef.current?.emit("message_read", { messageId, relationshipId: rel?.id });

  // Loading state
  if (relLoading || !rel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          className="stack-md items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[var(--text-secondary)] text-sm">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-white">
      <ChatHeaderUltra partner={rel.partner} partnerPresence={partnerPresence} onSetStatus={setStatus} />

      <AnimatePresence>
        {!connected && (
          <motion.div
            className="text-center py-1.5 glass glass-border border-b"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-xs text-[var(--status-warning)] hstack-sm justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
              Reconnecting...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            className="text-center py-1.5 glass border-b border-[var(--status-error)]/30 cursor-pointer"
            onClick={() => setError("")}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-xs text-[var(--status-error)]">{error} · tap to dismiss</span>
          </motion.div>
        )}
      </AnimatePresence>

      {messagesLoading ? (
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`skeleton h-12 rounded-2xl ${i % 2 === 0 ? "w-2/3 ml-auto" : "w-1/2"}`}
            />
          ))}
        </div>
      ) : (
        <MessageListUltra
          messages={messages}
          currentUserId={currentUserId}
          onMessageVisible={handleMessageVisible}
          onReply={setReplyTo}
          onEdit={setEditMessage}
          onDelete={handleDelete}
          onReact={handleReact}
          onRemoveReaction={handleRemoveReaction}
          onLoadOlder={handleLoadOlder}
          hasMore={!!nextCursor}
          loadingOlder={loadingOlder}
        />
      )}

      <TypingIndicatorUltra visible={partnerTyping} typingType={typingType} />

      <AnimatePresence>
        {currentEmotion && (
          <motion.div
            className="hstack-sm px-4 py-1.5 glass glass-border border-t"
            {...fadeIn}
            exit={{ opacity: 0, y: 10 }}
          >
            <p className="text-xs text-[var(--text-tertiary)]">Tone:</p>
            <EmotionBadge emotion={currentEmotion.emotion} confidence={currentEmotion.confidence} />
          </motion.div>
        )}
      </AnimatePresence>

      <MessageInputUltra
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={!connected}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editMessage={editMessage}
        onCancelEdit={() => setEditMessage(null)}
        relationshipId={rel?.id}
        onMediaSent={(media) => {
          socketRef.current?.emit("send_message", {
            relationshipId: rel?.id,
            type: media.type,
            content: media.originalName || "",
            mediaUrl: media.url,
            thumbnailUrl: media.thumbnailUrl || "",
            metadata: { fileSize: media.size, duration: media.duration || 0 },
          });
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        icon="🗑️"
        title="Delete this message?"
        description="This can't be undone for either of you."
        confirmText="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
