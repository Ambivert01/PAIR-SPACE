/**
 * MemoryCardUltra Component
 *
 * Premium memory card with emotional design and smooth animations
 */

import { motion } from "framer-motion";
import { scaleIn } from "../../utils/motionPresets.js";
import {
  EMOTION_META,
  MEMORY_TYPE_META,
} from "@shared/constants/memoryTypes.js";

import { MEDIA_BASE } from "@shared/constants/urls.js";
const BASE = MEDIA_BASE;

export default function MemoryCardUltra({
  memory,
  currentUserId,
  onClick,
  onPin,
  onFavorite,
  onReact,
  layout = "default", // default, large, text-only
}) {
  const { emoji: typeEmoji } = MEMORY_TYPE_META[memory.type] || { emoji: "💫" };
  const { emoji: emotionEmoji, color } =
    EMOTION_META[memory.emotionTag] || EMOTION_META.custom;
  const firstMedia = memory.mediaIds?.[0];
  const thumb = firstMedia?.thumbnailUrl || firstMedia?.url;
  const isFav = memory.favoritedBy?.some(
    (id) => id?.toString() === currentUserId || id === currentUserId,
  );
  const myReaction = memory.reactions?.find(
    (r) => r.userId?.toString() === currentUserId || r.userId === currentUserId,
  );

  const date = new Date(memory.memoryDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Text-only memory (emotional quote style)
  if (memory.type === "text_note" && !thumb) {
    return (
      <motion.div
        onClick={() => onClick(memory)}
        className="glass p-6 rounded-2xl cursor-pointer relative overflow-hidden group"
        {...scaleIn}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pinned indicator */}
        {memory.pinned && (
          <motion.span
            className="absolute top-3 right-3 text-lg"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            📌
          </motion.span>
        )}

        {/* Emotion badge */}
        <div className="hstack-sm mb-3">
          <span className={`text-2xl ${color}`}>{emotionEmoji}</span>
          <span className="text-xs text-[var(--text-tertiary)]">{date}</span>
        </div>

        {/* Text content */}
        <p className="text-base text-white italic leading-relaxed line-clamp-4">
          "{memory.description || memory.title}"
        </p>

        {/* Footer */}
        <div className="hstack-md justify-between mt-4 pt-3 border-t border-[var(--glass-border)]">
          <span className="text-xs text-[var(--text-tertiary)]">
            {typeEmoji} Note
          </span>
          <div className="hstack-sm">
            {memory.reactions?.length > 0 && (
              <span className="text-xs text-[var(--text-secondary)]">
                {memory.reactions[0].emoji}
                {memory.reactions.length > 1
                  ? ` +${memory.reactions.length - 1}`
                  : ""}
              </span>
            )}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(memory._id);
              }}
              className={`text-sm transition-colors ${
                isFav
                  ? "text-[var(--accent-love)]"
                  : "text-[var(--text-tertiary)]"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {isFav ? "❤️" : "🤍"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Image/video memory (default style)
  return (
    <motion.div
      onClick={() => onClick(memory)}
      className="card-glass overflow-hidden cursor-pointer group relative"
      {...scaleIn}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Media preview */}
      {thumb ? (
        <div className="relative h-56 overflow-hidden">
          <motion.img
            src={`${BASE}${thumb}`}
            alt={memory.title || "Memory"}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Pinned badge */}
          {memory.pinned && (
            <motion.div
              className="glass-strong px-2 py-1 rounded-full hstack-sm absolute top-3 right-3"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span className="text-sm">📌</span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                Pinned
              </span>
            </motion.div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 left-3 glass-strong px-2 py-1 rounded-full">
            <span className="text-sm">{typeEmoji}</span>
          </div>

          {/* Video play indicator */}
          {firstMedia?.type === "video" && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-14 h-14 glass-strong rounded-full flex items-center justify-center shadow-strong">
                <span className="text-white text-xl ml-1">▶</span>
              </div>
            </motion.div>
          )}

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="hstack-md justify-between gap-3">
              <div className="flex-1 min-w-0">
                {memory.title && (
                  <h3 className="text-sm font-semibold text-white truncate">
                    {memory.title}
                  </h3>
                )}
                {memory.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
                    {memory.description}
                  </p>
                )}
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">{date}</p>
              </div>
              <span className={`text-2xl flex-shrink-0 ${color}`}>
                {emotionEmoji}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center bg-gradient-to-br from-[var(--accent-love)]/20 to-[var(--accent-dream)]/20">
          <span className="text-5xl">{typeEmoji}</span>
        </div>
      )}

      {/* Footer actions */}
      <div className="p-3 hstack-md justify-between border-t border-[var(--glass-border)]">
        {/* Tags */}
        {memory.tags?.length > 0 ? (
          <div className="hstack-sm flex-wrap flex-1 min-w-0">
            {memory.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] glass px-2 py-0.5 rounded-full text-[var(--text-secondary)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Actions */}
        <div className="hstack-sm">
          {/* Reactions summary */}
          {memory.reactions?.length > 0 && (
            <span className="text-xs text-[var(--text-secondary)]">
              {memory.reactions[0].emoji}
              {memory.reactions.length > 1
                ? ` +${memory.reactions.length - 1}`
                : ""}
            </span>
          )}

          {/* Favorite */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(memory._id);
            }}
            className={`text-sm transition-colors ${
              isFav
                ? "text-[var(--accent-love)]"
                : "text-[var(--text-tertiary)]"
            }`}
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFav ? "❤️" : "🤍"}
          </motion.button>

          {/* Quick react */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onReact(memory._id, myReaction ? null : "❤️");
            }}
            className="text-xs text-[var(--text-tertiary)] hover:text-white transition-colors"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {myReaction ? myReaction.emoji : "+"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
