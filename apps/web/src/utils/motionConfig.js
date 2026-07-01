// Global motion configuration for consistent animations across the app

export const motionTiming = {
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
};

export const ease = [0.25, 0.8, 0.25, 1];

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: motionTiming.normal, ease },
};

export const buttonHover = {
  scale: 1.05,
  transition: { duration: motionTiming.fast, ease },
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1, ease },
};

export const cardHover = {
  y: -5,
  transition: { duration: motionTiming.fast, ease },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: motionTiming.normal, ease },
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: motionTiming.normal, ease },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: motionTiming.normal, ease },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: motionTiming.normal, ease },
};

export const revealOnScroll = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: motionTiming.normal, ease },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: motionTiming.normal, ease },
};

// Respect user's motion preferences
export const shouldReduceMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Get motion config based on user preference
export const getMotionConfig = (config) => {
  if (shouldReduceMotion()) {
    return {
      ...config,
      transition: { duration: 0 },
    };
  }
  return config;
};
