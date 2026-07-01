/**
 * VideoTileUltra Component
 *
 * Premium video tile with smooth animations
 */

import { motion } from "framer-motion";
import { scaleIn } from "../../utils/motionPresets.js";

export default function VideoTileUltra({
  videoRef,
  label,
  muted = false,
  cameraOff = false,
  small = false,
  mirror = false,
  fullscreen = false,
}) {
  return (
    <motion.div
      className={`relative bg-[var(--bg-secondary)] overflow-hidden ${
        fullscreen
          ? "w-full h-full"
          : small
            ? "w-32 h-48 rounded-2xl shadow-strong"
            : "w-full h-full rounded-2xl"
      }`}
      {...scaleIn}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${mirror ? "scale-x-[-1]" : ""} ${
          cameraOff ? "hidden" : ""
        }`}
      />

      {/* Camera off state */}
      {cameraOff && (
        <motion.div
          className="absolute inset-0 stack-sm items-center justify-center bg-gradient-to-br from-[var(--accent-love)]/20 to-[var(--accent-dream)]/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full glass-strong touch-target text-2xl"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {label?.[0]?.toUpperCase() || "?"}
          </motion.div>
          <p className="text-xs text-[var(--text-secondary)]">Camera off</p>
        </motion.div>
      )}

      {/* Label */}
      {label && !fullscreen && (
        <motion.div
          className="absolute bottom-2 left-2 glass-strong rounded-lg px-2 py-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-white font-medium">{label}</p>
        </motion.div>
      )}

      {/* Muted indicator */}
      {muted && (
        <motion.div
          className="absolute top-2 right-2 bg-red-500/90 rounded-full p-1.5 shadow-soft"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <span className="text-xs">🔇</span>
        </motion.div>
      )}
    </motion.div>
  );
}
