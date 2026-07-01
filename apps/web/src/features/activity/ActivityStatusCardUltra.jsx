/**
 * ActivityStatusCardUltra Component
 *
 * Premium activity status card with glassmorphism and smooth animations
 */

import { motion, AnimatePresence } from "framer-motion";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";
import { scaleIn } from "../../utils/motionPresets.js";

const LABELS = {
  watch_together: { text: "Watching together", emoji: "🎬" },
  listen_together: { text: "Listening together", emoji: "🎧" },
  focus_session: { text: "Focus session", emoji: "⏳" },
  study_session: { text: "Study session", emoji: "📚" },
  game_session: { text: "Game session", emoji: "🎮" },
  planning_session: { text: "Planning session", emoji: "📅" },
  reading_session: { text: "Reading together", emoji: "📖" },
  custom_session: { text: "Shared session", emoji: "✨" },
};

export default function ActivityStatusCardUltra({
  partner,
  partnerJoined,
  activityType,
}) {
  const label = LABELS[activityType] || { text: "Together", emoji: "✨" };

  return (
    <motion.div
      className="hstack-md justify-center gap-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* User avatar */}
      <motion.div
        className="stack-sm items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="relative">
          <motion.div
            className="w-12 h-12 rounded-full gradient-mixed flex items-center justify-center text-sm font-medium shadow-soft"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            You
          </motion.div>
          {/* Online indicator */}
          <motion.span
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[var(--bg-primary)] shadow-glow-dream"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          />
        </div>
        <motion.p
          className="text-xs text-[var(--text-secondary)] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You
        </motion.p>
      </motion.div>

      {/* Activity label */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.div
          className="glass-strong px-4 py-2 rounded-full hstack-sm shadow-soft"
          whileHover={{ scale: 1.05 }}
        >
          <motion.span
            className="text-lg"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {label.emoji}
          </motion.span>
          <span className="text-xs text-white font-medium">{label.text}</span>
        </motion.div>

        {/* Waiting indicator */}
        <AnimatePresence>
          {!partnerJoined && (
            <motion.div
              className="hstack-sm mt-2 justify-center"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <motion.div
                className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
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
              <motion.p
                className="text-xs text-yellow-500 font-medium"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Waiting for partner...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected indicator */}
        <AnimatePresence>
          {partnerJoined && (
            <motion.div
              className="hstack-sm mt-2 justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                className="w-1.5 h-1.5 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-xs text-[var(--status-success)] font-medium">
                Connected ✓
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Partner avatar */}
      <motion.div
        className="stack-sm items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <div className="relative">
          <motion.div
            className="w-12 h-12 rounded-full overflow-hidden shadow-soft"
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <PartnerAvatar
              displayName={partner?.displayName}
              avatarUrl={partner?.avatarUrl}
              size="md"
            />
          </motion.div>
          {/* Online/offline indicator */}
          <motion.span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-primary)] transition-colors ${
              partnerJoined ? "bg-green-400 shadow-glow-dream" : "bg-gray-600"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
          />
        </div>
        <motion.p
          className="text-xs text-[var(--text-secondary)] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {partner?.displayName || "Partner"}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
