/**
 * IncomingCallModalUltra Component
 *
 * Premium incoming call modal with smooth animations
 */

import { motion } from "framer-motion";
import { scaleIn } from "../../utils/motionPresets.js";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";

export default function IncomingCallModalUltra({
  partner,
  callType,
  onAccept,
  onReject,
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-strong rounded-3xl p-8 w-80 text-center space-y-6 shadow-strong"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Avatar with pulse animation */}
        <div className="stack-sm">
          <div className="flex justify-center">
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <PartnerAvatar
                displayName={partner?.displayName}
                avatarUrl={partner?.avatarUrl}
                size="xl"
              />

              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 border-4 border-[var(--accent-love)] rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              {/* Call type badge */}
              <motion.span
                className="absolute -bottom-2 -right-2 w-10 h-10 gradient-mixed rounded-full flex items-center justify-center text-xl shadow-soft"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {callType === "video" ? "📹" : "📞"}
              </motion.span>
            </motion.div>
          </div>

          {/* Partner info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-white font-semibold text-xl mb-1">
              {partner?.displayName}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm capitalize">
              Incoming {callType} call
            </p>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          className="hstack-lg justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Reject button */}
          <motion.button
            onClick={onReject}
            className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-3xl shadow-soft"
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
          >
            📵
          </motion.button>

          {/* Accept button */}
          <motion.button
            onClick={onAccept}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-3xl shadow-soft"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {callType === "video" ? "📹" : "📞"}
          </motion.button>
        </motion.div>

        {/* Hint text */}
        <motion.p
          className="text-xs text-[var(--text-tertiary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Tap to answer or decline
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
