/**
 * GlassCard Component
 *
 * Glassmorphism card with consistent styling
 */

import { motion } from "framer-motion";
import { cardHover, cardTap } from "../../utils/motionPresets.js";

export default function GlassCard({
  children,
  className = "",
  hover = true,
  onClick,
  ...props
}) {
  const Component = onClick ? motion.button : motion.div;

  const hoverProps = hover && !onClick ? cardHover : {};
  const tapProps = onClick ? cardTap : {};

  return (
    <Component
      className={`glass-card ${className}`}
      {...hoverProps}
      {...tapProps}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

// Variants
export function GlassCardStrong({ children, className = "", ...props }) {
  return (
    <motion.div
      className={`glass-strong rounded-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassCardInteractive({
  children,
  className = "",
  onClick,
  ...props
}) {
  return (
    <motion.button
      className={`glass-card hover-lift tap-scale ${className}`}
      onClick={onClick}
      {...cardHover}
      {...cardTap}
      {...props}
    >
      {children}
    </motion.button>
  );
}
