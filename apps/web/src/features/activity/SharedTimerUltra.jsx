/**
 * SharedTimerUltra Component
 *
 * Premium Pomodoro timer with gradient ring, partner status, and celebration
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn } from "../../utils/motionPresets.js";

const PRESETS = [
  { label: "25 min focus", work: 25, break: 5 },
  { label: "50 min focus", work: 50, break: 10 },
  { label: "15 min quick", work: 15, break: 3 },
];

export default function SharedTimerUltra({
  state,
  onStateChange,
  partnerJoined,
  partner,
}) {
  const [phase, setPhase] = useState("work"); // work | break
  const [preset, setPreset] = useState(PRESETS[0]);
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [remaining, setRemaining] = useState(state.currentTime || 25 * 60);
  const [showCelebration, setShowCelebration] = useState(false);
  const intervalRef = useRef(null);

  const paused = state.paused ?? true;

  // Sync from partner
  useEffect(() => {
    setRemaining(state.currentTime || totalSecs);
  }, [state.currentTime]);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            // Show celebration
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);

            // Switch phase
            const nextPhase = phase === "work" ? "break" : "work";
            const nextSecs =
              nextPhase === "work" ? preset.work * 60 : preset.break * 60;
            setPhase(nextPhase);
            setTotalSecs(nextSecs);
            onStateChange({ currentTime: nextSecs, paused: true });
            return nextSecs;
          }
          const next = prev - 1;
          // Broadcast every 5s to avoid spam
          if (next % 5 === 0)
            onStateChange({ currentTime: next, paused: false });
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused, phase, preset]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress =
    totalSecs > 0 ? ((totalSecs - remaining) / totalSecs) * 100 : 0;
  const circumference = 2 * Math.PI * 120; // radius 120 for w-64 h-64
  const strokeDash = circumference - (progress / 100) * circumference;

  const handlePreset = (p) => {
    setPreset(p);
    const secs = p.work * 60;
    setTotalSecs(secs);
    setRemaining(secs);
    setPhase("work");
    onStateChange({ currentTime: secs, paused: true });
  };

  return (
    <div className="stack-lg items-center py-8 relative">
      {/* Preset selector */}
      <motion.div
        className="hstack-sm flex-wrap justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {PRESETS.map((p) => (
          <motion.button
            key={p.label}
            onClick={() => handlePreset(p)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${
              preset.label === p.label
                ? "border-[var(--accent-dream)] glass-strong text-white shadow-glow-dream"
                : "border-[var(--glass-border)] glass text-[var(--text-secondary)] hover:border-[var(--glass-border-strong)]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {p.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Timer ring - larger w-64 h-64 */}
      <motion.div
        className="relative w-64 h-64"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="var(--glass-bg-strong)"
            strokeWidth="12"
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient
              id="timerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--accent-love)" />
              <stop offset="100%" stopColor="var(--accent-dream)" />
            </linearGradient>
          </defs>
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className="text-5xl font-mono font-bold text-white"
            key={`${mins}:${secs}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </motion.p>
          <motion.p
            className={`text-sm mt-2 font-medium ${
              phase === "work" ? "text-[var(--accent-dream)]" : "text-[var(--status-success)]"
            }`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {phase === "work" ? "Focus" : "Break"}
          </motion.p>
        </div>
      </motion.div>

      {/* Partner status */}
      {partnerJoined && partner && (
        <motion.div
          className="glass-strong px-4 py-2 rounded-full hstack-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm text-[var(--text-secondary)]">
            {partner.displayName} is focusing 🔥
          </span>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        className="hstack-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <motion.button
          onClick={() =>
            onStateChange({ currentTime: remaining, paused: !paused })
          }
          className="w-16 h-16 gradient-mixed rounded-full touch-target text-3xl shadow-soft"
          whileHover={{
            scale: 1.1,
            boxShadow: "0 0 30px rgba(255, 77, 109, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          {paused ? "▶" : "⏸"}
        </motion.button>
        <motion.button
          onClick={() => {
            const secs = preset.work * 60;
            setRemaining(secs);
            setPhase("work");
            onStateChange({ currentTime: secs, paused: true });
          }}
          className="touch-target glass-strong rounded-full text-xl hover:bg-[var(--glass-bg-strong)] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ↺
        </motion.button>
      </motion.div>

      {/* Waiting for partner */}
      {!partnerJoined && (
        <motion.div
          className="hstack-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <motion.div
            className="w-2 h-2 bg-yellow-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-xs text-yellow-500">
            Waiting for partner to join...
          </p>
        </motion.div>
      )}

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.p
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🎉
              </motion.p>
              <h3 className="text-2xl font-bold mb-2">
                {phase === "work" ? "Focus Complete!" : "Break Complete!"}
              </h3>
              <p className="text-[var(--text-secondary)]">
                Great work together!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
