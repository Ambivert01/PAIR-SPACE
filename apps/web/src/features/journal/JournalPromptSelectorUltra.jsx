/**
 * JournalPromptSelectorUltra Component
 *
 * Premium journal prompt selector with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JOURNAL_PROMPTS } from "@shared/constants/journalPrompts.js";
import { staggerContainer, staggerItem } from "../../utils/motionPresets.js";

export default function JournalPromptSelectorUltra({ entryType, onSelect }) {
  const [open, setOpen] = useState(false);
  const prompts = JOURNAL_PROMPTS[entryType] || JOURNAL_PROMPTS.custom_entry;

  return (
    <motion.div
      className="stack-xs"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[var(--accent-dream)] hover:text-[var(--accent-love)] transition-colors flex items-center gap-1.5"
        whileHover={{ scale: 1.02, x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {open ? "▼" : "▶"}
        </motion.span>
        <span>{open ? "Hide prompts" : "✨ Need a prompt?"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="stack-xs"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {prompts.map((p, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                }}
                className="w-full text-left text-xs text-[var(--text-secondary)] glass border border-[var(--glass-border)] hover:border-[var(--accent-dream)] hover:glass-dream rounded-xl px-4 py-3 transition-all"
                variants={staggerItem}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-[var(--accent-dream)] mr-1.5">❝</span>
                {p}
                <span className="text-[var(--accent-dream)] ml-1.5">❞</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
