/**
 * Motion Presets
 *
 * Simplified, performance-optimized animation configurations
 * Fast, smooth, purposeful - no excessive decorative animations
 */

// ========================================
// CORE ANIMATIONS - Fast & Smooth
// ========================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

// ========================================
// INTERACTION ANIMATIONS - Subtle & Fast
// ========================================

export const hoverLift = {
  whileHover: { y: -2, scale: 1.01 },
  transition: { duration: 0.15 },
};

export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1 },
};

// ========================================
// PAGE TRANSITIONS - Quick & Clean
// ========================================

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

// ========================================
// MODAL ANIMATIONS - Fast & Smooth
// ========================================

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 12 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

// ========================================
// MESSAGE ANIMATIONS - Smooth Entry
// ========================================

export const messageSend = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

// ========================================
// LOADING ANIMATIONS - Simple & Fast
// ========================================

export const spinnerRotate = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: "linear" },
};

export const dotPulse = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// ========================================
// STAGGER ANIMATIONS - Subtle Cascade
// ========================================

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

// ========================================
// DEPRECATED - DO NOT USE
// These animations are too heavy/distracting
// ========================================

// REMOVED: float, pulse, rotate, messageFloat, reactionPop
// REMOVED: cardHover (too aggressive), hoverGlow (too flashy)
// Use simple hoverLift and tapScale instead
