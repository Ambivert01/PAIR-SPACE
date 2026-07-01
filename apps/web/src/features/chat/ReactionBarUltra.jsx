/**
 * ReactionBarUltra Component
 *
 * Premium reaction display with glassmorphism and smooth animations
 */

import { motion } from "framer-motion";
import { scaleIn } from "../../utils/motionPresets.js";

export default function ReactionBarUltra({
  reactions = [],
  currentUserId,
  onReact,
  onRemove,
}) {
  if (!reactions.length) return null;

  // Group by emoji
  const grouped = reactions.reduce((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || { emoji: r.emoji, count: 0, mine: false };
    acc[r.emoji].count++;
    if (r.userId?.toString() === currentUserId) acc[r.emoji].mine = true;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {Object.values(grouped).map(({ emoji, count, mine }, index) => (
        <motion.button
          key={emoji}
          onClick={() => (mine ? onRemove() : onReact(emoji))}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${
            mine
              ? "glass-love border-[var(--accent-love)]/50 text-[var(--accent-love)] shadow-glow-love"
              : "glass border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--accent-dream)]/50 hover:text-[var(--accent-dream)]"
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm">{emoji}</span>
          {count > 1 && (
            <span className="font-medium text-[10px]">{count}</span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
