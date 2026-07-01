/**
 * CountdownRevealTimerUltra Component
 *
 * Premium gift reveal countdown with glassmorphism and smooth animations
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CountdownRevealTimerUltra({ scheduledRevealTime }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(scheduledRevealTime) - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ready!");
        setIsReady(true);
        return;
      }
      setIsReady(false);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else setTimeLeft(`${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [scheduledRevealTime]);

  return (
    <motion.div
      className="text-center stack-sm py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Hourglass icon */}
      <motion.p
        className="text-5xl"
        animate={
          isReady
            ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }
            : {
                rotate: [0, 180, 0],
              }
        }
        transition={{
          duration: isReady ? 1 : 3,
          repeat: Infinity,
          repeatDelay: isReady ? 0.5 : 0,
          ease: "easeInOut",
        }}
      >
        {isReady ? "🎁" : "⏳"}
      </motion.p>

      {/* Countdown display */}
      <motion.div
        className={`glass-strong px-6 py-3 rounded-full inline-block ${
          isReady ? "shadow-glow-love" : ""
        }`}
        animate={
          isReady
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: isReady ? Infinity : 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={timeLeft}
            className={`font-mono text-2xl font-bold ${
              isReady ? "text-[var(--accent-love)]" : "text-white"
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

      {/* Helper text */}
      <motion.p
        className="text-xs text-[var(--text-tertiary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isReady
          ? "Your surprise is ready!"
          : "until your surprise is revealed"}
      </motion.p>

      {/* Ready indicator */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="hstack-sm justify-center glass-love px-4 py-2 rounded-full inline-flex"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
          >
            <motion.div
              className="w-2 h-2 bg-[var(--accent-love)] rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <span className="text-xs text-[var(--accent-love)] font-medium">
              Tap to reveal
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
