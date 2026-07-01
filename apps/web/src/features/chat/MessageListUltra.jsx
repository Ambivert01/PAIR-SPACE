/**
 * MessageListUltra Component
 *
 * Premium message list with floating orbs, smooth scrolling, and date separators
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../../utils/motionPresets.js";
import MessageBubbleUltra from "./MessageBubbleUltra.jsx";

export default function MessageListUltra({
  messages,
  currentUserId,
  onMessageVisible,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
  onLoadOlder,
  hasMore,
  loadingOlder,
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const userScrolledUp = useRef(false);
  const prevScrollHeight = useRef(0);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleScroll = () => {
    userScrolledUp.current = !isNearBottom();
    // Load older messages when near top
    if (containerRef.current?.scrollTop < 60 && hasMore && !loadingOlder) {
      prevScrollHeight.current = containerRef.current.scrollHeight;
      onLoadOlder?.();
    }
  };

  // Maintain scroll position after prepending older messages
  useEffect(() => {
    const el = containerRef.current;
    if (el && prevScrollHeight.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
  }, [messages.length]);

  // Auto scroll to bottom on new messages (only if user is at bottom)
  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark last unread partner message as read
  useEffect(() => {
    const lastUnread = [...messages]
      .reverse()
      .find(
        (m) => m.senderId?.toString() !== currentUserId && m.status !== "read",
      );
    if (lastUnread) onMessageVisible?.(lastUnread._id);
  }, [messages, currentUserId, onMessageVisible]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 relative overflow-hidden">
        {/* Empty state content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💬
          </motion.div>
          <motion.p
            className="text-[var(--text-secondary)] text-base mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Start your story here ❤️
          </motion.p>
          <motion.p
            className="text-[var(--text-tertiary)] text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Say hello to begin
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Messages container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-4 py-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Loading older messages indicator */}
        <AnimatePresence>
          {loadingOlder && (
            <motion.div
              className="flex justify-center py-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="glass px-4 py-2 rounded-full hstack-sm">
                <motion.div
                  className="w-3 h-3 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-xs text-[var(--text-secondary)]">
                  Loading...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beginning of conversation indicator */}
        {!hasMore && messages.length > 0 && (
          <motion.p
            className="text-center text-xs text-[var(--text-tertiary)] py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Beginning of conversation
          </motion.p>
        )}

        {/* Messages grouped by date */}
        <div>
          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <DateSeparator date={group.date} />

              {/* Messages for this date */}
              <div className="space-y-0.5">
                {group.messages.map((msg, idx) => {
                  const prevMsg = group.messages[idx - 1];
                  const showAvatar =
                    !prevMsg ||
                    prevMsg.senderId?.toString() !== msg.senderId?.toString();

                  return (
                    <MessageBubbleUltra
                      key={msg._id}
                      message={msg}
                      isOwn={msg.senderId?.toString() === currentUserId}
                      currentUserId={currentUserId}
                      showAvatar={showAvatar}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onReact={onReact}
                      onRemoveReaction={onRemoveReaction}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function DateSeparator({ date }) {
  return (
    <motion.div
      className="sticky top-0 z-10 flex justify-center my-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-strong px-4 py-1.5 rounded-full shadow-soft">
        <span className="text-xs text-[var(--text-secondary)] font-medium">
          {date}
        </span>
      </div>
    </motion.div>
  );
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentGroup = null;

  messages.forEach((msg) => {
    const date = formatDate(new Date(msg.createdAt));

    if (!currentGroup || currentGroup.date !== date) {
      currentGroup = { date, messages: [] };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(msg);
  });

  return groups;
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  // Within last week: show day name
  const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  // Older: show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
