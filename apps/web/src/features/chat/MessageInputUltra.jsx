/**
 * MessageInputUltra Component
 *
 * Premium message input with smooth animations and modern design
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn, fadeUp } from "../../utils/motionPresets.js";
import EmojiPickerUltra from "./EmojiPickerUltra.jsx";
import ReplyPreviewUltra from "./ReplyPreviewUltra.jsx";
import FilePicker from "../media/FilePicker.jsx";

export default function MessageInputUltra({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
  replyTo,
  onCancelReply,
  editMessage,
  onCancelEdit,
  relationshipId,
  onMediaSent,
}) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editMessage) {
      setText(editMessage.content);
      textareaRef.current?.focus();
    }
  }, [editMessage]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (!isTyping.current) {
      isTyping.current = true;
      onTypingStart?.();
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      onTypingStop?.(val);
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend({
      content: trimmed,
      replyToMessageId: replyTo?._id,
      editMessageId: editMessage?._id,
    });
    setText("");
    clearTimeout(typingTimer.current);
    isTyping.current = false;
    onTypingStop?.(trimmed);
    if (replyTo) onCancelReply?.();
    if (editMessage) onCancelEdit?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      onCancelReply?.();
      onCancelEdit?.();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  const isEditing = !!editMessage;
  const hasText = text.trim().length > 0;

  return (
    <div className="relative">
      {showFilePicker && (
        <FilePicker
          relationshipId={relationshipId}
          context="chat"
          onUploaded={(result) => {
            onMediaSent?.(result);
            setShowFilePicker(false);
          }}
          onClose={() => setShowFilePicker(false)}
        />
      )}

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && !isEditing && (
          <motion.div {...fadeUp}>
            <ReplyPreviewUltra message={replyTo} onCancel={onCancelReply} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit mode indicator */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 glass border-b border-[var(--accent-love)]"
            {...fadeUp}
          >
            <span className="text-xs text-[var(--accent-love)] flex-1">
              ✏️ Editing message
            </span>
            <motion.button
              onClick={onCancelEdit}
              className="text-[var(--text-secondary)] hover:text-white text-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 py-3" style={{ background: "rgba(18,10,23,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
        <div
          className={`flex items-end gap-2 rounded-2xl px-3 py-2 transition-all duration-300 ${
            isFocused
              ? "border-2 border-[var(--accent-dream)] shadow-glow-dream"
              : "border border-[var(--glass-border)]"
          }`}
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {/* Attachment button */}
          <motion.button
            onClick={() => {
              setShowEmoji(false);
              setShowFilePicker((v) => !v);
            }}
            disabled={disabled || !!editMessage}
            className="touch-target text-[var(--text-secondary)] hover:text-white disabled transition-colors flex-shrink-0"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            📎
          </motion.button>

          {/* Emoji button */}
          <div className="relative flex-shrink-0">
            <motion.button
              onClick={() => setShowEmoji((v) => !v)}
              className="touch-target text-[var(--text-secondary)] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              😊
            </motion.button>
            {showEmoji && (
              <EmojiPickerUltra
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isEditing ? "Edit message..." : "Message..."}
            maxLength={2000}
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-white placeholder-[var(--text-tertiary)] outline-none resize-none disabled py-1.5"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!hasText || disabled}
            className={`touch-target rounded-full transition-all flex-shrink-0 ${
              hasText && !disabled
                ? isEditing
                  ? "gradient-love shadow-soft"
                  : "gradient-mixed shadow-soft"
                : "bg-[var(--glass-bg)] disabled"
            }`}
            whileHover={hasText && !disabled ? { scale: 1.1 } : {}}
            whileTap={hasText && !disabled ? { scale: 0.9 } : {}}
            animate={
              hasText && !disabled
                ? {
                    boxShadow: [
                      "0 0 20px rgba(255, 77, 109, 0.3)",
                      "0 0 30px rgba(255, 77, 109, 0.5)",
                      "0 0 20px rgba(255, 77, 109, 0.3)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isEditing ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
