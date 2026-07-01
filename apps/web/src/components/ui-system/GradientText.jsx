/**
 * GradientText Component
 *
 * Text with gradient effects
 */

import { motion } from "framer-motion";

export default function GradientText({
  children,
  variant = "mixed",
  className = "",
  animate = false,
  ...props
}) {
  const variants = {
    love: "gradient-text-love",
    dream: "gradient-text-dream",
    mixed: "gradient-text-mixed",
  };

  const Component = animate ? motion.span : "span";

  return (
    <Component className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}

// Animated gradient text
export function AnimatedGradientText({ children, className = "", ...props }) {
  return (
    <motion.span
      className={`gradient-text-mixed ${className}`}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "200% 200%",
      }}
      {...props}
    >
      {children}
    </motion.span>
  );
}
