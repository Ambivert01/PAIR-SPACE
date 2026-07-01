/**
 * LoadingStates Component
 *
 * Consistent loading indicators
 */

import { motion } from "framer-motion";
import { spinnerRotate, dotPulse } from "../../utils/motionPresets.js";

// Spinner loader
export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <motion.div
      className={`${sizes[size]} border-white/30 border-t-white rounded-full ${className}`}
      {...spinnerRotate}
    />
  );
}

// Dots loader
export function DotsLoader({ className = "" }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-white rounded-full"
          {...dotPulse}
          transition={{
            ...dotPulse.transition,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Skeleton loader
export function Skeleton({ className = "", variant = "text" }) {
  const variants = {
    text: "skeleton-text",
    title: "skeleton-title",
    avatar: "skeleton-avatar",
    card: "h-48 rounded-xl",
  };

  return <div className={`skeleton ${variants[variant]} ${className}`} />;
}

// Full page loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)] z-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}

// Loading overlay
export function LoadingOverlay({ message = "Loading..." }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <Spinner size="md" />
        <p className="mt-3 text-white text-sm">{message}</p>
      </div>
    </motion.div>
  );
}
