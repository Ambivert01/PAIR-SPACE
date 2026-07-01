/**
 * MemoryFilterBarUltra Component
 *
 * Premium memory filter bar with glassmorphism and smooth animations
 */

import { motion } from "framer-motion";
import {
  EMOTION_TAGS,
  EMOTION_META,
  MEMORY_TYPE_META,
} from "@shared/constants/memoryTypes.js";

const TYPES = [
  "photo",
  "video",
  "text_note",
  "milestone",
  "letter",
  "location_visit",
  "achievement",
];

export default function MemoryFilterBarUltra({ filters, onChange }) {
  const set = (key, val) =>
    onChange({ ...filters, [key]: filters[key] === val ? "" : val });

  return (
    <div className="stack-sm px-4 py-3 glass border-b border-[var(--glass-border)]">
      {/* Emotion row */}
      <div className="hstack-sm overflow-x-auto pb-1 scrollbar-hide">
        {EMOTION_TAGS.slice(0, 8).map((tag, index) => {
          const { emoji } = EMOTION_META[tag];
          const active = filters.emotion === tag;
          return (
            <motion.button
              key={tag}
              onClick={() => set("emotion", tag)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200 ${
                active
                  ? "border-[var(--accent-dream)] glass-dream text-white shadow-glow-dream"
                  : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--accent-dream)]/50"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {emoji} {tag}
            </motion.button>
          );
        })}
      </div>

      {/* Type + sort row */}
      <div className="hstack-sm overflow-x-auto pb-1 scrollbar-hide">
        {TYPES.map((type, index) => {
          const { emoji, label } = MEMORY_TYPE_META[type];
          const active = filters.type === type;
          return (
            <motion.button
              key={type}
              onClick={() => set("type", type)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-200 ${
                active
                  ? "border-[var(--accent-dream)] glass-dream text-white shadow-glow-dream"
                  : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--accent-dream)]/50"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 8) * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {emoji} {label}
            </motion.button>
          );
        })}

        <motion.button
          onClick={() => set("pinned", "true")}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-200 ml-auto ${
            filters.pinned === "true"
              ? "border-[var(--accent-love)] glass-love text-[var(--accent-love)] shadow-glow-love"
              : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--accent-love)]/50"
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📌 Pinned
        </motion.button>
      </div>
    </div>
  );
}
