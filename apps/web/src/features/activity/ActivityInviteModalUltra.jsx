/**
 * ActivityInviteModalUltra Component
 *
 * Premium invitation modal with animated emoji and glass effects
 */

import { motion } from "framer-motion";
import { modalBackdrop, modalContent } from "../../utils/motionPresets.js";

const ACTIVITY_EMOJIS = {
  watch_together: "🎬",
  listen_together: "🎧",
  focus_session: "⏳",
  study_session: "📚",
  game_session: "🎮",
  planning_session: "📅",
  reading_session: "📖",
  custom_session: "✨",
};

export default function ActivityInviteModalUltra({
  invite,
  partner,
  onJoin,
  onDecline,
}) {
  const emoji = ACTIVITY_EMOJIS[invite.activityType] || "✨";
  const activityLabel = invite.activityType.replace(/_/g, " ");

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      {...modalBackdrop}
    >
      <motion.div
        className="glass-strong rounded-3xl p-8 max-w-md w-full text-center shadow-strong"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Animated emoji */}
        <motion.div
          className="text-7xl mb-6"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.div>

        {/* Title */}
        <motion.h3
          className="text-xl font-semibold mb-2 text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {partner?.displayName} invited you
        </motion.h3>

        {/* Activity type */}
        <motion.p
          className="text-sm text-[var(--text-secondary)] mb-2 capitalize"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activityLabel}
        </motion.p>

        {/* Metadata title */}
        {invite.metadata?.title && (
          <motion.p
            className="text-xs text-[var(--text-tertiary)] mb-6 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {invite.metadata.title}
          </motion.p>
        )}

        {/* Buttons */}
        <motion.div
          className="flex gap-3 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={onDecline}
            className="flex-1 glass-strong rounded-xl py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Decline
          </motion.button>
          <motion.button
            onClick={onJoin}
            className="flex-1 gradient-mixed rounded-xl py-3 text-sm font-semibold shadow-soft"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(255, 77, 109, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Join
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
