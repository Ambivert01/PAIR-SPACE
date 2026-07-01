import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeatureTooltip({ features, onComplete, onSkip }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const current = features[idx];
  const isLast  = idx === features.length - 1;

  const next = () => {
    if (isLast) { setVisible(false); setTimeout(onComplete, 250); }
    else setIdx(idx + 1);
  };
  const skip = () => { setVisible(false); setTimeout(onSkip, 250); };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(8,2,14,0.7)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs px-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            <div className="card-glass glass-strong text-center space-y-4">
              <motion.div
                key={idx}
                className="text-5xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                {current.emoji}
              </motion.div>

              <motion.div key={`text-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="text-h3 text-white">{current.title}</h3>
                <p className="text-caption mt-1">{current.description}</p>
              </motion.div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {features.map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 rounded-full"
                    animate={{
                      width: i === idx ? 24 : 8,
                      background: i === idx ? "var(--accent-love)" : i < idx ? "var(--accent-dream-soft)" : "var(--glass-border-strong)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={skip} className="flex-1 btn-ghost btn-base text-sm">
                  Skip tour
                </button>
                <motion.button
                  onClick={next}
                  className="flex-1 btn-primary btn-base text-sm"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isLast ? "Let's go! ✨" : "Next"}
                </motion.button>
              </div>

              <p className="text-small">{idx + 1} of {features.length}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
