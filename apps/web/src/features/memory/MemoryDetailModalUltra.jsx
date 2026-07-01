/**
 * MemoryDetailModalUltra Component
 *
 * Premium memory detail modal with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import {
  EMOTION_META,
  MEMORY_TYPE_META,
} from "@shared/constants/memoryTypes.js";
import {
  togglePin,
  toggleFavorite,
  reactToMemory,
  addComment,
  deleteMemory,
} from "./memoryService.js";
import MediaViewer from "../media/MediaViewer.jsx";
import {
  modalBackdrop,
  modalContent,
  fadeUp,
  scaleIn,
  staggerContainer,
  staggerItem,
} from "../../utils/motionPresets.js";

import { MEDIA_BASE } from "@shared/constants/urls.js";
const BASE = MEDIA_BASE;
const QUICK_REACTIONS = ["❤️", "😍", "🥺", "😂", "🔥", "🙏"];

export default function MemoryDetailModalUltra({
  memory: initial,
  currentUserId,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [memory, setMemory] = useState(initial);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewerMedia, setViewerMedia] = useState(null);

  const { emoji: typeEmoji, label: typeLabel } = MEMORY_TYPE_META[
    memory.type
  ] || { emoji: "💫", label: "Memory" };
  const { emoji: emotionEmoji, color } =
    EMOTION_META[memory.emotionTag] || EMOTION_META.custom;
  const isFav = memory.favoritedBy?.some(
    (id) => id?.toString() === currentUserId || id === currentUserId,
  );
  const myReaction = memory.reactions?.find(
    (r) => r.userId?.toString() === currentUserId || r.userId === currentUserId,
  );
  const isCreator =
    memory.creatorId?._id?.toString() === currentUserId ||
    memory.creatorId?.toString() === currentUserId;

  const refresh = (patch) => {
    const updated = { ...memory, ...patch };
    setMemory(updated);
    onUpdated?.(updated);
  };

  const handlePin = async () => {
    const { pinned } = await togglePin(memory._id);
    refresh({ pinned });
  };

  const handleFav = async () => {
    await toggleFavorite(memory._id);
    const already = memory.favoritedBy?.some(
      (id) => id?.toString() === currentUserId,
    );
    refresh({
      favoritedBy: already
        ? memory.favoritedBy.filter((id) => id?.toString() !== currentUserId)
        : [...(memory.favoritedBy || []), currentUserId],
    });
  };

  const handleReact = async (emoji) => {
    const { reactions } = await reactToMemory(
      memory._id,
      myReaction?.emoji === emoji ? null : emoji,
    );
    refresh({ reactions });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { comments } = await addComment(memory._id, commentText.trim());
      refresh({ comments });
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    await deleteMemory(memory._id);
    onDeleted(memory._id);
    onClose();
  };

  const date = new Date(memory.memoryDate).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
    <AnimatePresence>
      {viewerMedia && (
        <MediaViewer media={viewerMedia} onClose={() => setViewerMedia(null)} />
      )}

      <motion.div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center z-40 p-4"
        {...modalBackdrop}
        onClick={onClose}
      >
        <motion.div
          className="glass-strong rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--glass-border)] shadow-2xl"
          {...modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="hstack-md justify-between px-5 py-4 border-b border-[var(--glass-border)] sticky top-0 glass-strong z-10">
            <motion.div
              className="hstack-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-lg">{typeEmoji}</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {typeLabel}
              </span>
            </motion.div>
            <div className="hstack-md">
              <motion.button
                onClick={handlePin}
                className={`text-sm transition-colors ${
                  memory.pinned
                    ? "text-[var(--status-warning)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                📌
              </motion.button>
              <motion.button
                onClick={handleFav}
                className={`text-sm transition-colors ${
                  isFav
                    ? "text-[var(--status-error)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {isFav ? "❤️" : "🤍"}
              </motion.button>
              {isCreator && (
                <motion.button
                  onClick={handleDelete}
                  className="text-[var(--text-tertiary)] hover:text-[var(--status-error)] text-sm transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  🗑
                </motion.button>
              )}
              <motion.button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-white text-xl transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>
          </div>

          {/* Media gallery */}
          {memory.mediaIds?.length > 0 && (
            <motion.div
              className={`grid gap-1 ${
                memory.mediaIds.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {memory.mediaIds.map((m, index) => {
                const url = `${BASE}${m.thumbnailUrl || m.url}`;
                return (
                  <motion.div
                    key={m._id}
                    className="relative cursor-pointer overflow-hidden"
                    onClick={() =>
                      setViewerMedia({ ...m, url: `${BASE}${m.url}` })
                    }
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {m.type === "video" ? (
                      <div className="relative h-48 glass flex items-center justify-center">
                        {m.thumbnailUrl ? (
                          <img
                            src={`${BASE}${m.thumbnailUrl}`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <span className="text-4xl">🎬</span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="w-10 h-10 glass-strong rounded-full flex items-center justify-center shadow-soft"
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className="text-white text-sm ml-0.5">▶</span>
                          </motion.div>
                        </div>
                      </div>
                    ) : m.type === "audio" ? (
                      <div className="h-24 glass flex items-center justify-center gap-3 px-4">
                        <span className="text-3xl">🎵</span>
                        <audio
                          src={`${BASE}${m.url}`}
                          controls
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt=""
                        className="w-full h-48 object-cover"
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Content */}
          <div className="p-5 stack-md">
            {/* Title + emotion */}
            <motion.div className="hstack-md justify-between gap-3" {...fadeUp}>
              <div>
                {memory.title && (
                  <h2 className="text-lg font-semibold text-white">
                    {memory.title}
                  </h2>
                )}
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {date}
                </p>
              </div>
              <motion.span
                className={`text-2xl ${color}`}
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {emotionEmoji}
              </motion.span>
            </motion.div>

            {/* Description */}
            {memory.description && (
              <motion.p
                className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {memory.description}
              </motion.p>
            )}

            {/* Location */}
            {memory.location?.name && (
              <motion.p
                className="text-xs text-[var(--text-tertiary)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                📍 {memory.location.name}
              </motion.p>
            )}

            {/* Tags */}
            {memory.tags?.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {memory.tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="text-xs glass border border-[var(--glass-border)] text-[var(--text-secondary)] px-2.5 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Reactions */}
            <motion.div
              className="stack-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="hstack-sm">
                {QUICK_REACTIONS.map((e, index) => (
                  <motion.button
                    key={e}
                    onClick={() => handleReact(e)}
                    className={`text-lg transition-opacity ${
                      myReaction?.emoji === e
                        ? "opacity-100"
                        : "opacity-50 hover:opacity-100"
                    }`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: myReaction?.emoji === e ? 1 : 0.5,
                      scale: 1,
                    }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {e}
                  </motion.button>
                ))}
              </div>
              {memory.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(
                    memory.reactions.reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {}),
                  ).map(([emoji, count], index) => (
                    <motion.span
                      key={emoji}
                      className="text-xs glass border border-[var(--glass-border)] px-2 py-0.5 rounded-full text-[var(--text-secondary)]"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {emoji} {count}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Comments */}
            <motion.div
              className="stack-md border-t border-[var(--glass-border)] pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                Comments
              </p>
              {memory.comments?.length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  No comments yet.
                </p>
              )}
              <motion.div
                className="stack-md"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {memory.comments?.map((c, i) => (
                  <motion.div
                    key={i}
                    className="hstack-md"
                    variants={staggerItem}
                  >
                    <div className="w-6 h-6 rounded-full gradient-mixed flex items-center justify-center text-xs flex-shrink-0 shadow-soft">
                      {c.userId?.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)]">
                        {c.userId?.displayName || "You"}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                        {c.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <form onSubmit={handleComment} className="hstack-sm">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={500}
                  className="flex-1 glass glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-[var(--text-tertiary)] outline-none focus-ring transition-all"
                />
                <motion.button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="btn-primary rounded-xl px-3 py-2 text-xs disabled shadow-soft"
                  whileHover={{
                    scale: !commentText.trim() || submitting ? 1 : 1.05,
                  }}
                  whileTap={{
                    scale: !commentText.trim() || submitting ? 1 : 0.95,
                  }}
                >
                  →
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    <ConfirmModal
      isOpen={showDeleteConfirm}
      icon="🗑️"
      title="Delete this memory?"
      description="This is permanent — the memory will be gone for both of you."
      confirmText="Delete memory"
      danger
      onConfirm={confirmDelete}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  );
}
