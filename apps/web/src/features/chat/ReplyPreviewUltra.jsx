/**
 * ReplyPreviewUltra Component
 *
 * Premium reply preview with glassmorphism and smooth animations
 */

import { motion } from "framer-motion";
import { fadeUp } from "../../utils/motionPresets.js";

export default function ReplyPreviewUltra({ message, onCancel }) {
  if (!message) return null;

  const preview = message.deleted
    ? "Deleted message"
    : message.content?.slice(0, 80) || `${message.type} message`;

  return (
    <motion.div
      className="hstack-md px-4 py-3 glass glass-border border-t"
      {...fadeUp}
      exit={{ opacity: 0, y: 10 }}
    >
      <div className="flex-1 border-l-2 border-[var(--accent-dream)] pl-3">
        <p className="text-xs text-[var(--accent-dream)] font-medium mb-1">
          Replying to message
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {preview}
        </p>
      </div>
      <motion.button
        onClick={onCancel}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xl leading-none transition-colors p-1"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        ×
      </motion.button>
    </motion.div>
  );
}
