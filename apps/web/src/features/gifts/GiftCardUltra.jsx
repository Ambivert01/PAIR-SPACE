import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GIFT_TYPES } from "@shared/constants/giftTypes.js";

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatCountdown = (ms) => {
  if (ms <= 0) return "Opening soon...";
  const totalSeconds = Math.floor(ms / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0)   return `${days}d ${hours}h remaining`;
  if (hours > 0)  return `${hours}h ${minutes}m remaining`;
  if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
  return `${seconds}s remaining`;
};

function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(() =>
    targetDate ? Math.max(0, new Date(targetDate) - Date.now()) : 0,
  );
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setRemaining(Math.max(0, new Date(targetDate) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return remaining;
}

export default function GiftCardUltra({ gift, currentUserId, onClick }) {
  const typeMeta = GIFT_TYPES.find((t) => t.value === gift.giftType) || {
    emoji: "🎁", label: "Gift", color: "from-indigo-900/60 to-purple-900/60",
  };
  const isSender  = gift.senderId?._id?.toString() === currentUserId || gift.senderId?.toString() === currentUserId;
  const isHidden  = gift._hidden;
  const isScheduled = gift.revealMode !== "instant";
  const isUnopened  = !gift.opened && !isSender;

  // Compute reveal target date for live countdown
  const revealTarget = gift.revealMode === "scheduled"
    ? gift.scheduledRevealTime
    : gift.revealMode === "countdown" && gift.countdownDays
      ? (() => {
          const t = new Date(gift.createdAt);
          t.setDate(t.getDate() + gift.countdownDays);
          return t.toISOString();
        })()
      : null;

  const countdownMs = useCountdown(revealTarget);
  const isRevealable = revealTarget && countdownMs === 0 && !gift.opened;

  return (
    <motion.button
      onClick={() => onClick(gift)}
      className={`w-full glass rounded-2xl p-5 text-left stack-sm transition-all border ${
        isUnopened
          ? "border-[var(--accent-love)] shadow-glow-love"
          : "border-[var(--glass-border)]"
      }`}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <motion.span
          className="text-3xl"
          animate={
            isUnopened
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: isUnopened ? Infinity : 0,
            repeatDelay: 1,
          }}
        >
          {isHidden ? "🎁" : typeMeta.emoji}
        </motion.span>
        <div className="text-right stack-xs">
          {gift.opened && (
            <span className="text-xs text-[var(--status-success)] flex items-center gap-1">
              ✓ Opened
            </span>
          )}
          {isUnopened && !isRevealable && (
            <motion.span className="text-xs text-[var(--accent-love)] font-medium flex items-center gap-1" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              ✨ Tap to open
            </motion.span>
          )}
          {isRevealable && (
            <motion.span className="text-xs text-[var(--status-warning)] font-medium" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              🎉 Ready to open!
            </motion.span>
          )}
          {isScheduled && !gift.opened && revealTarget && countdownMs > 0 && (
            <span className="text-xs text-[var(--accent-dream-soft)] font-mono">
              ⏳ {formatCountdown(countdownMs)}
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {isHidden ? "A surprise is waiting..." : gift.title || typeMeta.label}
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 font-light">
          {isSender
            ? "You sent"
            : `From ${gift.senderId?.displayName || "partner"}`}{" "}
          · {timeAgo(gift.createdAt)}
        </p>
      </div>

      {gift.reaction && (
        <motion.p
          className="text-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {gift.reaction}
        </motion.p>
      )}
    </motion.button>
  );
}
