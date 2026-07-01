import { motion } from "framer-motion";
import { revealOnScroll, getMotionConfig } from "../../utils/motionConfig.js";

export default function ScrollReveal({ children, className = "", delay = 0 }) {
  const config = {
    ...revealOnScroll,
    transition: {
      ...revealOnScroll.transition,
      delay,
    },
  };

  return (
    <motion.div className={className} {...getMotionConfig(config)}>
      {children}
    </motion.div>
  );
}
