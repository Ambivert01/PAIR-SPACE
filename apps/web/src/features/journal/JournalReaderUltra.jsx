import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JOURNAL_ENTRY_TYPES } from "@shared/constants/journalPrompts.js";
import { EMOTION_META } from "@shared/constants/memoryTypes.js";
import {
  reactToEntry,
  toggleBookmark,
  convertToMemory,
  deleteEntry,
} from "./journalService.js";
import JournalResponseBoxUltra from "./JournalResponseBoxUltra.jsx";
import FutureLetterTimerUltra from "./FutureLetterTimerUltra.jsx";

const QUICK_REACTIONS = ["❤️", "🥺", "😊", "💙", "🙏", "✨"];

const fmt = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function JournalReaderUltra({
  entry: initial,
  currentUserId,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [entry, setEntry] = useState(initial);
  const typeMeta = JOURNAL_ENTRY_TYPES.find((t) => t.value === entry.type) || {
    emoji: "📓",
    label: "Entry",
  };
  const emotionMeta = EMOTION_META[entry.emotionTag] || {
    emoji: "💙",
    color: "text-[var(--status-info)]",
  };
  const isOwn =
    entry.authorId?._id?.toString() === currentUserId ||
    entry.authorId?.toString() === currentUserId;
  const myReaction = entry.reactions?.find(
    (r) => r.userId?.toString() === currentUserId || r.userId === currentUserId,
  );
  const isBookmarked = entry.bookmarkedBy?.some(
    (id) => id?.toString() === currentUserId || id === currentUserId,
  );
  const isFutureLocked =
    entry.type === "future_letter" &&
    entry.scheduledOpenDate &&
    new Date(entry.scheduledOpenDate) > new Date();

  const patch = (updates) => {
    const u = { ...entry, ...updates };
    setEntry(u);
    onUpdated?.(u);
  };

  const handleReact = async (emoji) => {
    const { reactions } = await reactToEntry(
      entry._id,
      myReaction?.emoji === emoji ? null : emoji,
    ).catch(() => ({ reactions: entry.reactions }));
    patch({ reactions });
  };

  const handleBookmark = async () => {
    const { bookmarked } = await toggleBookmark(entry._id).catch(() => ({
      bookmarked: isBookmarked,
    }));
    const bookmarkedBy = bookmarked
      ? [...(entry.bookmarkedBy || []), currentUserId]
      : (entry.bookmarkedBy || []).filter(
          (id) => id?.toString() !== currentUserId,
        );
    patch({ bookmarkedBy });
  };

  const handleConvert = async () => {
    if (entry.convertedToMemoryId) return;
    const { memoryId } = await convertToMemory(entry._id).catch(() => ({}));
    if (memoryId) patch({ convertedToMemoryId: memoryId });
  };

  const handleDelete = async () => {
    setDeleteTargetEntry(entry._id || entry.id);
    return; // ConfirmModal handles the actual delete
    await deleteEntry(entry._id).catch(() => {});
    onDeleted?.(entry._id);
    onClose();
  };

  const confirmDeleteEntry = async () => {
    if (!deleteTargetEntry) return;
    await deleteEntry(deleteTargetEntry);
    onDeleted?.(deleteTargetEntry);
    setDeleteTargetEntry(null);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[#0f0f14] to-[#1c1c24] z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="hstack-md px-6 py-5 border-b border-[var(--glass-border)] sticky top-0 bg-gradient-to-br from-[#0f0f14] to-[#1c1c24] backdrop-blur-xl z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.button
          onClick={onClose}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <span className="text-2xl">{typeMeta.emoji}</span>
        <p className="text-sm text-[var(--text-secondary)] flex-1 capitalize font-light">
          {typeMeta.label}
        </p>
        <motion.button
          onClick={handleBookmark}
          className={`text-xl transition-colors ${
            isBookmarked
              ? "text-[var(--status-warning)]"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          🔖
        </motion.button>
        {isOwn && !entry.convertedToMemoryId && (
          <motion.button
            onClick={handleConvert}
            title="Save as memory"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-lg transition-colors"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            📸
          </motion.button>
        )}
        {isOwn && (
          <motion.button
            onClick={handleDelete}
            className="text-[var(--text-tertiary)] hover:text-[var(--status-error)] text-lg transition-colors"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            🗑
          </motion.button>
        )}
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 py-12 stack-lg">
        {/* Future letter locked */}
        {isFutureLocked ? (
          <FutureLetterTimerUltra scheduledOpenDate={entry.scheduledOpenDate} />
        ) : (
          <>
            {/* Title + meta */}
            <motion.div
              className="stack-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {entry.title && (
                <h1 className="text-3xl font-light text-[var(--text-primary)] leading-tight">
                  {entry.title}
                </h1>
              )}
              <div className="hstack-md">
                <p className="text-xs text-[var(--text-tertiary)] font-light">
                  {fmt(entry.createdAt)}
                </p>
                <motion.span
                  className={`text-lg ${emotionMeta.color}`}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {emotionMeta.emoji}
                </motion.span>
                {entry.convertedToMemoryId && (
                  <span className="text-xs text-[var(--text-tertiary)]">
                    📸 Saved as memory
                  </span>
                )}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="w-16 h-0.5 bg-gradient-to-r from-[var(--accent-love)] to-[var(--accent-dream)]"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />

            {/* Content */}
            <motion.div
              className="text-[var(--text-primary)] text-lg leading-loose whitespace-pre-wrap font-light"
              style={{ lineHeight: "1.7" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {entry.content}
            </motion.div>

            {/* Reactions */}
            <motion.div
              className="stack-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex gap-3">
                {QUICK_REACTIONS.map((e, i) => (
                  <motion.button
                    key={e}
                    onClick={() => handleReact(e)}
                    className={`text-2xl transition-all ${
                      myReaction?.emoji === e
                        ? "opacity-100"
                        : "opacity-40 hover:opacity-100"
                    }`}
                    whileHover={{ scale: 1.3, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: myReaction?.emoji === e ? 1 : 0.4,
                      scale: 1,
                    }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    {e}
                  </motion.button>
                ))}
              </div>
              {entry.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    entry.reactions.reduce((a, r) => {
                      a[r.emoji] = (a[r.emoji] || 0) + 1;
                      return a;
                    }, {}),
                  ).map(([emoji, count]) => (
                    <motion.span
                      key={emoji}
                      className="text-xs glass px-3 py-1 rounded-full text-[var(--text-secondary)]"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {emoji} {count}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Responses */}
            <motion.div
              className="stack-lg border-t border-[var(--glass-border)] pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-light">
                Responses
              </p>
              {entry.responses?.length === 0 && (
                <p className="text-sm text-[var(--text-tertiary)] font-light">
                  No responses yet.
                </p>
              )}
              <AnimatePresence>
                {entry.responses?.map((r, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-love)] to-[var(--accent-dream)] touch-target text-sm flex-shrink-0 font-medium">
                      {r.authorId?.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[var(--text-secondary)]">
                        {r.authorId?.displayName || "Partner"}
                      </p>
                      <p className="text-sm text-[var(--text-primary)] mt-1.5 leading-relaxed whitespace-pre-wrap font-light">
                        {r.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <JournalResponseBoxUltra
                entryId={entry._id}
                onAdded={(responses) => patch({ responses })}
              />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
