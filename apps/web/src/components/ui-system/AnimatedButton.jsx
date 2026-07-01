/**
 * AnimatedButton Component
 *
 * Button with smooth animations and variants
 */

import { motion } from "framer-motion";
import { hoverScale, tapScale } from "../../utils/motionPresets.js";

export default function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      className={`${variants[variant]} ${sizes[size]} ${className} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      {...hoverScale}
      {...tapScale}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}

// Icon button variant
export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <motion.button
      className={`${sizes[size]} flex items-center justify-center rounded-full ${
        variant === "ghost" ? "hover:bg-white/10" : "btn-" + variant
      } ${className}`}
      {...hoverScale}
      {...tapScale}
      {...props}
    >
      {children}
    </motion.button>
  );
}
