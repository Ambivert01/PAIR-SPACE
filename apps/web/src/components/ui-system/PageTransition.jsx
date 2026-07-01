import { motion } from "framer-motion";
import { pageTransition, getMotionConfig } from "../../utils/motionConfig.js";

export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div className={className} {...getMotionConfig(pageTransition)}>
      {children}
    </motion.div>
  );
}
