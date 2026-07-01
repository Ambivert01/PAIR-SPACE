import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.6,
  size: 6 + Math.random() * 8,
  color: ["#ff5d7e", "#a855f7", "#ffc163", "#ff8fa8", "#c98bff"][i % 5],
  rotation: Math.random() * 360,
}));

const FIRST_VISIT_KEY = "pairspace_first_pair_shown";

/**
 * FirstConnectionCelebration
 *
 * Fires exactly once — when a new couple's space first becomes active.
 * After that, the key is set in localStorage and the modal never shows again.
 *
 * @param {string} partnerName — the partner's display name
 * @param {boolean} isFirstEntry — true only on the very first load after pairing
 */
export default function FirstConnectionCelebration({ partnerName, isFirstEntry }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isFirstEntry) return;
    const shown = localStorage.getItem(FIRST_VISIT_KEY);
    if (!shown) {
      // Small delay so the dashboard renders first, then we celebrate
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [isFirstEntry]);

  const handleDismiss = () => {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[1500] flex items-center justify-center"
          style={{ background: "rgba(8, 2, 14, 0.85)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti particles */}
          {CONFETTI_PIECES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: "-10px",
                width: p.size,
                height: p.size * 0.5,
                background: p.color,
                rotate: p.rotation,
              }}
              animate={{
                y: ["0vh", "110vh"],
                rotate: [p.rotation, p.rotation + 360],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}

          {/* Card */}
          <motion.div
            className="card-glass glass-strong max-w-xs w-full mx-4 text-center"
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              💞
            </motion.div>

            <h2 className="text-h2 gradient-text-mixed mb-2">Your space is ready!</h2>
            <p className="text-caption mb-6">
              You and {partnerName} are now connected. This is your private world — just for the two of you.
            </p>

            {/* Ambient glow rings */}
            <div className="relative flex justify-center mb-6">
              {[1.6, 1.3, 1.0].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute w-16 h-16 rounded-full border border-[var(--accent-love)]"
                  animate={{ scale: [scale, scale * 1.15, scale], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  style={{ opacity: 0.4 - i * 0.1 }}
                />
              ))}
              <div className="w-16 h-16 rounded-full gradient-mixed flex items-center justify-center text-2xl shadow-glow-love">
                🔒
              </div>
            </div>

            <motion.button
              onClick={handleDismiss}
              className="w-full btn-primary btn-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Let's begin ✨
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
