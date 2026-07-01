import { motion } from "framer-motion";
import {
  CAPSULE_TYPES,
  CAPSULE_VISIBILITY,
} from "@shared/constants/capsuleTypes.js";

const fmt = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function CapsuleCardUltra({ capsule, currentUserId, onClick }) {
  const typeMeta = CAPSULE_TYPES.find(
    (t) => t.value === capsule.capsuleType,
  ) || {
    emoji: "⏳",
    label: "Capsule",
  };
  const state = capsule.visibilityState || "locked";
  const vis = CAPSULE_VISIBILITY[state] || CAPSULE_VISIBILITY.locked;
  const isCreator =
    capsule.creatorId?._id?.toString() === currentUserId ||
    capsule.creatorId?.toString() === currentUserId;
  const isReady = state === "ready_to_open";

  return (
    <motion.button
      onClick={() => onClick(capsule)}
      className={`w-full glass rounded-2xl p-5 text-left space-y-3 transition-all border ${
        isReady
          ? "border-[var(--accent-dream)] border-dashed shadow-glow-dream"
          : "border-[var(--glass-border)] border-dashed"
      }`}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="hstack-md">
          <motion.span
            className="text-2xl"
            animate={
              isReady
                ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: isReady ? Infinity : 0,
              repeatDelay: 1,
            }}
          >
            {capsule._hidden ? "🔒" : typeMeta.emoji}
          </motion.span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {capsule._hidden
                ? "Locked capsule"
                : capsule.title || typeMeta.label}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 font-light">
              {isCreator
                ? "You created"
                : `From ${capsule.creatorId?.displayName || "partner"}`}
            </p>
          </div>
        </div>
        <motion.span
          className={`text-xs ${vis.color} flex items-center gap-1`}
          animate={
            isReady
              ? {
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: isReady ? Infinity : 0,
          }}
        >
          {vis.emoji} {vis.label}
        </motion.span>
      </div>

      <div className="hstack-md justify-between text-xs text-[var(--text-tertiary)] font-light">
        <span>Created {fmt(capsule.createdAt)}</span>
        {state !== "opened" && <span>Unlocks {fmt(capsule.lockedUntil)}</span>}
        {state === "opened" && capsule.reaction && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {capsule.reaction}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
