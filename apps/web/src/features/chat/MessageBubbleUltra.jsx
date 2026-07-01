/**
 * MessageBubbleUltra Component
 *
 * Premium message bubble with smooth animations and interactions
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messageSend, scaleIn } from "../../utils/motionPresets.js";
import ReactionBarUltra from "./ReactionBarUltra.jsx";
import MediaViewer from "../media/MediaViewer.jsx";
import { MEDIA_BASE } from "@shared/constants/urls.js";

const STATUS_ICON = { queued: "🕓", sending: "○", sent: "✓", delivered: "✓✓", read: "✓✓" };
const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

export default function MessageBubbleUltra({
  message,
  isOwn,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
  showAvatar = false,
}) {
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [viewerMedia, setViewerMedia] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (message.deleted) {
    return (
      <motion.div
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}
        {...scaleIn}
      >
        <div className="px-3.5 py-2 rounded-2xl text-xs text-[var(--text-tertiary)] italic glass">
          Message deleted
        </div>
      </motion.div>
    );
  }

  if (message.type === "system") {
    return (
      <motion.div className="flex justify-center my-3" {...scaleIn}>
        <span className="text-xs text-[var(--text-tertiary)] glass px-4 py-2 rounded-full">
          {message.content}
        </span>
      </motion.div>
    );
  }

  const isMedia = ["image", "video", "audio", "file"].includes(message.type);

  return (
    <>
      {viewerMedia && (
        <MediaViewer media={viewerMedia} onClose={() => setViewerMedia(null)} />
      )}

      <motion.div
        className={`flex flex-col ${isOwn ? "items-end" : "items-start"} mb-0.5 group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowReactPicker(false); }}
        {...messageSend}
      >
        {/* Reply context */}
        {message.replyTo && (
          <motion.div
            className={`max-w-[65%] mb-1 px-3 py-2 rounded-xl border-l-2 glass ${
              isOwn
                ? "border-[var(--accent-love)] mr-1"
                : "border-[var(--accent-dream)] ml-1"
            }`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {message.replyTo.deleted
                ? "Deleted message"
                : message.replyTo.content?.slice(0, 60)}
            </p>
          </motion.div>
        )}

        <div className="relative flex items-end gap-2">
          {/* Hover actions (left side for received) */}
          {!isOwn && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="flex gap-1 mb-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <HoverMenu
                    isOwn={false}
                    onReply={() => onReply(message)}
                    onReact={() => setShowReactPicker((v) => !v)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Message bubble */}
          <motion.div
            className={`max-w-[75%] sm:max-w-[65%] rounded-2xl overflow-hidden text-sm ${
              isOwn
                ? "rounded-br-sm text-white shadow-soft"
                : "rounded-bl-sm text-white"
            } ${isMedia ? "cursor-pointer" : ""}`}
            style={isOwn ? {
              background: "linear-gradient(135deg, var(--accent-love), var(--accent-love-soft))",
              boxShadow: "0 4px 20px rgba(255,93,126,0.25)"
            } : {
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() =>
              isMedia &&
              setViewerMedia({
                ...message,
                url: `${MEDIA_BASE}${message.mediaUrl}`,
                type: message.type,
              })
            }
            whileHover={isMedia ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <MediaContent message={message} isOwn={isOwn} />

            {/* Text content */}
            {message.content && (
              <p
                className="break-words overflow-wrap-anywhere whitespace-pre-wrap px-4 py-2.5"
                style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
              >
                {message.content}
              </p>
            )}

            {/* Timestamp and status */}
            <div
              className={`flex items-center gap-1.5 px-4 pb-2 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {message.edited && (
                <span className="text-[10px] opacity-40">edited</span>
              )}
              <span className="text-[10px] opacity-50">{time}</span>
              {isOwn && (
                <span
                  className={`text-[10px] flex items-center gap-1 ${
                    message.status === "read"
                      ? "text-white opacity-80"
                      : message.status === "queued"
                        ? "text-[var(--status-warning)] opacity-90"
                        : "opacity-40"
                  }`}
                >
                  {message.status === "queued" && (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                    >
                      ●
                    </motion.span>
                  )}
                  {message.status === "queued" ? "Queued" : STATUS_ICON[message.status] || "✓"}
                </span>
              )}
            </div>
          </motion.div>

          {/* Hover actions (right side for sent) */}
          {isOwn && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="flex gap-1 mb-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <HoverMenu
                    isOwn={true}
                    onReply={() => onReply(message)}
                    onEdit={
                      message.type === "text" ? () => onEdit(message) : null
                    }
                    onDelete={() => onDelete(message._id)}
                    onReact={() => setShowReactPicker((v) => !v)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Reaction picker */}
          <AnimatePresence>
            {showReactPicker && (
              <motion.div
                className={`absolute bottom-full mb-2 ${
                  isOwn ? "right-10" : "left-10"
                } glass-strong rounded-2xl px-3 py-2 flex gap-2 shadow-strong z-50`}
                {...scaleIn}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    onClick={() => {
                      onReact(message._id, emoji);
                      setShowReactPicker(false);
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                    whileHover={{ scale: 1.3, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions */}
        <div className={isOwn ? "mr-1" : "ml-1"}>
          <ReactionBarUltra
            reactions={message.reactions}
            currentUserId={currentUserId}
            onReact={(emoji) => onReact(message._id, emoji)}
            onRemove={() => onRemoveReaction(message._id)}
          />
        </div>
      </motion.div>
    </>
  );
}

function MediaContent({ message, isOwn }) {
  const url = message.mediaUrl
    ? `${MEDIA_BASE}${message.mediaUrl}`
    : null;
  const thumb = message.thumbnailUrl
    ? `${MEDIA_BASE}${message.thumbnailUrl}`
    : null;

  if (message.type === "image") {
    return (
      <motion.img
        src={thumb || url}
        alt="image"
        className="w-full max-w-[280px] max-h-56 object-cover"
        loading="lazy"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      />
    );
  }

  if (message.type === "video") {
    return (
      <div className="relative w-full max-w-[280px]">
        {thumb ? (
          <img
            src={thumb}
            alt="video"
            className="w-full max-h-48 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-[var(--bg-secondary)] flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <div className="w-12 h-12 glass-strong rounded-full flex items-center justify-center shadow-soft">
            <span className="text-white text-lg ml-1">▶</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (message.type === "audio") {
    return (
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <span className="text-2xl">🎵</span>
        <div className="flex-1">
          <div className="h-1.5 bg-white/20 rounded-full w-32" />
          {message.metadata?.duration > 0 && (
            <p className="text-[10px] opacity-50 mt-1.5">
              {Math.round(message.metadata.duration)}s
            </p>
          )}
        </div>
      </div>
    );
  }

  if (message.type === "file") {
    return (
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <span className="text-2xl">📄</span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate max-w-[180px]">
            {message.content || "File"}
          </p>
          <p className="text-[10px] opacity-50">tap to download</p>
        </div>
      </div>
    );
  }

  return null;
}

function HoverMenu({ isOwn, onReply, onEdit, onDelete, onReact }) {
  return (
    <div className="flex gap-1">
      <MenuBtn onClick={onReact} title="React">
        😊
      </MenuBtn>
      <MenuBtn onClick={onReply} title="Reply">
        ↩
      </MenuBtn>
      {isOwn && onEdit && (
        <MenuBtn onClick={onEdit} title="Edit">
          ✏️
        </MenuBtn>
      )}
      {isOwn && onDelete && (
        <MenuBtn onClick={onDelete} title="Delete">
          🗑
        </MenuBtn>
      )}
    </div>
  );
}

function MenuBtn({ onClick, title, children }) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      className="w-8 h-8 glass-strong rounded-lg text-xs flex items-center justify-center"
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
