/**
 * CallControlsUltra Component
 *
 * Premium call controls with smooth animations
 */

import { motion } from "framer-motion";

export default function CallControlsUltra({
  callType,
  isMuted,
  isCameraOff,
  isScreenSharing,
  onMute,
  onCamera,
  onScreenShare,
  onEnd,
}) {
  return (
    <div className="hstack-md justify-center">
      {/* Mute button */}
      <ControlButton
        onClick={onMute}
        active={isMuted}
        activeClass="bg-red-500/80"
        inactiveClass="glass-strong"
        label={isMuted ? "Unmute" : "Mute"}
        icon={isMuted ? "🔇" : "🎙️"}
      />

      {/* Camera button (video calls only) */}
      {callType !== "voice" && (
        <ControlButton
          onClick={onCamera}
          active={isCameraOff}
          activeClass="bg-red-500/80"
          inactiveClass="glass-strong"
          label={isCameraOff ? "Camera on" : "Camera off"}
          icon={isCameraOff ? "📷" : "📹"}
        />
      )}

      {/* Screen share button */}
      <ControlButton
        onClick={onScreenShare}
        active={isScreenSharing}
        activeClass="bg-[var(--accent-dream)]/80"
        inactiveClass="glass-strong"
        label={isScreenSharing ? "Stop sharing" : "Share screen"}
        icon="🖥️"
      />

      {/* End call button (larger, red) */}
      <motion.button
        onClick={onEnd}
        className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full touch-target text-2xl shadow-strong"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        title="End call"
      >
        📵
      </motion.button>
    </div>
  );
}

function ControlButton({
  onClick,
  active,
  activeClass,
  inactiveClass,
  label,
  icon,
}) {
  return (
    <motion.button
      onClick={onClick}
      title={label}
      className={`w-14 h-14 rounded-full touch-target text-2xl transition-colors shadow-soft ${
        active ? activeClass : inactiveClass
      }`}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.button>
  );
}
