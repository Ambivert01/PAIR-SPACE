import { motion } from "framer-motion";
import { JOURNAL_ENTRY_TYPES } from "@shared/constants/journalPrompts.js";
import { EMOTION_META } from "@shared/constants/memoryTypes.js";

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function JournalEntryCardUltra({
  entry,
  currentUserId,
  onClick,
}) {
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
  const isFutureLetter =
    entry.type === "future_letter" &&
    entry.scheduledOpenDate &&
    new Date(entry.scheduledOpenDate) > new Date();

  return (
    <motion.button
      onClick={() => onClick(entry)}
      className="w-full glass p-6 rounded-2xl text-left stack-sm transition-all border border-[var(--glass-border)] hover:border-[var(--accent-dream)]/50 shadow-soft hover:shadow-glow-dream"
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="hstack-sm">
          <motion.span
            className="text-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {typeMeta.emoji}
          </motion.span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {isFutureLetter
                ? "🔮 Future Letter"
                : entry.title || typeMeta.label}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 font-light">
              {isOwn ? "You" : entry.authorId?.displayName} ·{" "}
              {timeAgo(entry.createdAt)}
            </p>
          </div>
        </div>
        <motion.span
          className={`text-xl flex-shrink-0 ${emotionMeta.color}`}
          whileHover={{ scale: 1.2, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {emotionMeta.emoji}
        </motion.span>
      </div>

      {!isFutureLetter && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-light">
          {entry.content}
        </p>
      )}

      <div className="hstack-md text-xs text-[var(--text-tertiary)]">
        {entry.responses?.length > 0 && (
          <span className="flex items-center gap-1">
            💬 {entry.responses.length}
          </span>
        )}
        {entry.reactions?.length > 0 && (
          <span className="flex items-center gap-1">
            {entry.reactions[0].emoji} {entry.reactions.length}
          </span>
        )}
        {entry.bookmarkedBy?.includes(currentUserId) && <span>🔖</span>}
        {entry.convertedToMemoryId && <span>📸 In memories</span>}
      </div>
    </motion.button>
  );
}
