/**
 * TypingIndicatorUltra Component
 *
 * Premium typing indicator with smooth animations
 */

import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../../utils/motionPresets.js";

export default function TypingIndicatorUltra({ visible, typingType = "text" }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="flex justify-start mb-2 px-4"
          {...fadeUp}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="glass rounded-2xl rounded-bl-sm px-4 py-2.5 hstack-sm">
            {typingType === "voice" ? (
              <>
                <span className="text-xs text-[var(--text-secondary)]">
                  🎙 Recording...
                </span>
                <motion.span
                  className="w-1.5 h-1.5 bg-[var(--accent-love)] rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.6, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </>
            ) : (
              <div className="hstack-sm">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full"
                    animate={{
                      y: [0, -6, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
