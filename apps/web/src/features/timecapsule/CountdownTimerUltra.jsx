/**
 * CountdownTimerUltra Component
 *
 * Premium countdown timer with glassmorphism and smooth animations
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CountdownTimerUltra({ lockedUntil, onUnlocked }) {
  const [parts, setParts] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(lockedUntil) - Date.now();
      if (diff <= 0) {
        setParts({ ready: true });
        onUnlocked?.();
        return;
      }
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [lockedUntil, onUnlocked]);

  if (parts.ready)
    return (
      <motion.div
        className="text-center stack-xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.p
          className="text-4xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          🎁
        </motion.p>
        <motion.p
          className="text-[var(--status-success)] font-medium text-sm"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Ready to open!
        </motion.p>
      </motion.div>
    );

  return (
    <div className="flex items-center justify-center gap-3">
      {[
        ["d", "days"],
        ["h", "hrs"],
        ["m", "min"],
        ["s", "sec"],
      ].map(([k, label], index) => (
        <motion.div
          key={k}
          className="text-center glass-strong rounded-xl p-3 min-w-[60px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={parts[k]}
              className="text-2xl font-mono font-bold text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {String(parts[k] || 0).padStart(2, "0")}
            </motion.p>
          </AnimatePresence>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-1">
            {label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
