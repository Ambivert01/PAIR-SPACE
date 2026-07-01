/**
 * CallStatusIndicatorUltra Component
 *
 * Premium call status indicator with glassmorphism and smooth animations
 */

import { motion, AnimatePresence } from "framer-motion";
import { CALL_STATE } from "./useCall.js";

const CONFIG = {
  [CALL_STATE.CALLING]: {
    text: "Calling...",
    gradient: "gradient-dream",
    glowClass: "shadow-glow-dream",
    pulse: true,
  },
  [CALL_STATE.RINGING]: {
    text: "Incoming call",
    gradient: "gradient-love",
    glowClass: "shadow-glow-love",
    pulse: true,
  },
  [CALL_STATE.CONNECTED]: {
    text: "Connected",
    gradient: "gradient-mixed",
    glowClass: "shadow-glow-dream",
    pulse: false,
  },
  [CALL_STATE.RECONNECTING]: {
    text: "Reconnecting...",
    gradient: "gradient-dream",
    glowClass: "shadow-glow-dream",
    pulse: true,
  },
  [CALL_STATE.ENDED]: {
    text: "Call ended",
    gradient: "",
    glowClass: "",
    pulse: false,
  },
};

export default function CallStatusIndicatorUltra({ state }) {
  const cfg = CONFIG[state];
  if (!cfg) return null;

  const isEnded = state === CALL_STATE.ENDED;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        className={`hstack-sm px-4 py-2 rounded-full text-xs font-medium ${
          isEnded ? "glass" : `glass-strong ${cfg.glowClass}`
        }`}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pulse indicator */}
        {cfg.pulse && (
          <motion.span
            className={`w-2 h-2 rounded-full ${cfg.gradient}`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Status text */}
        <motion.span
          className={isEnded ? "text-[var(--text-tertiary)]" : "text-white"}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {cfg.text}
        </motion.span>

        {/* Connected icon */}
        {state === CALL_STATE.CONNECTED && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            ✓
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
