import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

const COOLDOWN_MS = 30_000;
const PARTICLES = ["💗", "💕", "✨", "💖", "🌸"];

export default function HeartbeatButton({ relationshipId, className = "" }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState("");

  // Countdown tick
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const spawnParticles = useCallback(() => {
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: `${Date.now()}_${i}`,
      emoji: PARTICLES[i % PARTICLES.length],
      x: (Math.random() - 0.5) * 80,
      y: -(40 + Math.random() * 60),
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  }, []);

  const handleTap = async () => {
    if (sending || cooldownRemaining > 0 || !relationshipId) return;

    setSending(true);
    setError("");
    try {
      await api.post("/api/heartbeat/tap", { relationshipId });
      setSent(true);
      spawnParticles();
      setCooldownRemaining(COOLDOWN_MS);
      setTimeout(() => setSent(false), 2500);
    } catch (err) {
      const cd = err.response?.data?.cooldownMs;
      if (cd) {
        setCooldownRemaining(cd);
      } else {
        setError("Couldn't send — try again");
        setTimeout(() => setError(""), 3000);
      }
    } finally {
      setSending(false);
    }
  };

  const cooldownPct = cooldownRemaining / COOLDOWN_MS;
  const secondsLeft = Math.ceil(cooldownRemaining / 1000);
  const isReady = cooldownRemaining === 0 && !sending;

  return (
    <div className={`relative flex flex-col items-center gap-2 ${className}`}>
      {/* Floating heart particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute text-xl left-1/2 bottom-1/2"
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* The button itself */}
      <motion.button
        onClick={handleTap}
        disabled={!isReady}
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-glow-love"
        style={{
          background: isReady
            ? "var(--gradient-love)"
            : "rgba(255,93,126,0.2)",
          transition: "background 0.3s",
        }}
        whileHover={isReady ? { scale: 1.12 } : {}}
        whileTap={isReady ? { scale: 0.88 } : {}}
        animate={
          sent
            ? { scale: [1, 1.35, 1], transition: { duration: 0.4 } }
            : {}
        }
        aria-label="Send a heartbeat to your partner"
      >
        {/* Cooldown ring */}
        {cooldownRemaining > 0 && (
          <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32" cy="32" r="29"
              fill="none"
              stroke="rgba(255,93,126,0.4)"
              strokeWidth="3"
              strokeDasharray={`${182 * (1 - cooldownPct)} 182`}
            />
          </svg>
        )}

        <motion.span
          animate={
            sent
              ? { scale: [1, 1.5, 1] }
              : isReady
              ? { scale: [1, 1.05, 1] }
              : {}
          }
          transition={
            sent
              ? { duration: 0.4 }
              : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {sent ? "💗" : "🫀"}
        </motion.span>
      </motion.button>

      {/* Status label */}
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.p
            key="sent"
            className="text-xs text-[var(--accent-love-soft)] font-medium"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            Sent! 💗
          </motion.p>
        ) : cooldownRemaining > 0 ? (
          <motion.p
            key="cooldown"
            className="text-xs text-[var(--text-disabled)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {secondsLeft}s
          </motion.p>
        ) : error ? (
          <motion.p key="error" className="text-xs text-[var(--status-error)]">
            {error}
          </motion.p>
        ) : (
          <motion.p
            key="idle"
            className="text-xs text-[var(--text-tertiary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Thinking of you
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
