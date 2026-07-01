/**
 * EmotionTagSelectorUltra Component
 *
 * Premium emotion tag selector with glassmorphism and smooth animations
 */

import { motion } from "framer-motion";
import { EMOTION_TAGS, EMOTION_META } from "@shared/constants/memoryTypes.js";

export default function EmotionTagSelectorUltra({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {EMOTION_TAGS.map((tag, index) => {
        const { emoji, color } = EMOTION_META[tag];
        const selected = value === tag;
        return (
          <motion.button
            key={tag}
            type="button"
            onClick={() => onChange(tag)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
              selected
                ? "border-[var(--accent-dream)] glass-dream shadow-glow-dream"
                : "glass border-[var(--glass-border)] hover:border-[var(--accent-dream)]/50"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="text-lg"
              animate={selected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {emoji}
            </motion.span>
            <span
              className={`text-[10px] capitalize ${
                selected ? color : "text-[var(--text-secondary)]"
              }`}
            >
              {tag}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
