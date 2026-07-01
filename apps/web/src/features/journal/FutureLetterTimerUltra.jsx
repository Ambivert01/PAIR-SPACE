/**
 * FutureLetterTimerUltra Component
 *
 * Premium future letter timer with glassmorphism and smooth animations
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn } from "../../utils/motionPresets.js";

export default function FutureLetterTimerUltra({ scheduledOpenDate }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(scheduledOpenDate) - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ready to open!");
        setIsReady(true);
        return;
      }
      setIsReady(false);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTimeLeft(`Opens in ${d} day${d !== 1 ? "s" : ""}`);
      else if (h > 0) setTimeLeft(`Opens in ${h}h ${m}m`);
      else setTimeLeft(`Opens in ${m} minute${m !== 1 ? "s" : ""}`);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [scheduledOpenDate]);

  const openDate = new Date(scheduledOpenDate).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Crystal ball icon with animation */}
      <motion.div
        className="relative"
        animate={
          isReady
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }
            : {
                y: [0, -10, 0],
              }
        }
        transition={{
          duration: isReady ? 1 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-6xl">{isReady ? "✨" : "🔮"}</span>

        {/* Glow effect when ready */}
        {isReady && (
          <motion.div
            className="absolute inset-0 bg-[var(--accent-dream)] blur-2xl opacity-50 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Title */}
      <motion.div
        className="stack-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-white font-medium text-lg">Future Letter</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          A message from the past
        </p>
      </motion.div>

      {/* Time left badge */}
      <motion.div
        className={`glass-strong px-6 py-3 rounded-full shadow-soft ${
          isReady ? "shadow-glow-dream" : ""
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={timeLeft}
            className={`text-sm font-medium ${
              isReady
                ? "text-[var(--accent-dream)]"
                : "text-[var(--text-secondary)]"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {timeLeft}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Open date */}
      <motion.div
        className="glass px-4 py-2 rounded-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-[var(--text-tertiary)]">
          Opens on{" "}
          <span className="text-[var(--text-secondary)] font-medium">
            {openDate}
          </span>
        </p>
      </motion.div>

      {/* Ready indicator */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="hstack-sm glass-dream px-4 py-2 rounded-full"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="w-2 h-2 bg-[var(--accent-dream)] rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="text-xs text-[var(--accent-dream)] font-medium">
              Click to reveal your letter
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[var(--accent-dream)] rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
