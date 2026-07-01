/**
 * PageWrapper Component
 *
 * Consistent page layout with animations
 */

import { motion } from "framer-motion";
import { pageTransition } from "../../utils/motionPresets.js";
import { FloatingOrbs } from "./FloatingOrb.jsx";

export default function PageWrapper({
  children,
  showOrbs = true,
  className = "",
  ...props
}) {
  return (
    <motion.div
      className={`relative min-h-screen ${className}`}
      {...pageTransition}
      {...props}
    >
      {showOrbs && <FloatingOrbs />}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Section wrapper with scroll reveal
export function SectionWrapper({
  children,
  className = "",
  reveal = true,
  ...props
}) {
  const revealProps = reveal
    ? {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
      }
    : {};

  return (
    <motion.section
      className={`py-12 px-6 ${className}`}
      {...revealProps}
      {...props}
    >
      {children}
    </motion.section>
  );
}
