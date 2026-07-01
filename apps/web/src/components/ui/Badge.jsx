/**
 * Badge Component
 *
 * Small status indicators
 * Variants: default, success, error, warning, info
 * Sizes: sm, md, lg
 */

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-full";

  const variants = {
    default: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    success: "bg-green-500/20 text-green-300 border border-green-500/30",
    error: "bg-red-500/20 text-red-300 border border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    primary:
      "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-300 border border-pink-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotColors = {
    default: "bg-purple-400",
    success: "bg-green-400",
    error: "bg-red-400",
    warning: "bg-yellow-400",
    info: "bg-blue-400",
    primary: "bg-pink-400",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
