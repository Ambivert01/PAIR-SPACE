/**
 * Card Component
 *
 * Consistent card styles for memories, plans, journal, gifts, etc.
 * Variants: default, elevated, interactive
 * Supports: hover effects, click handlers
 */

export default function Card({
  children,
  variant = "default",
  interactive = false,
  onClick,
  className = "",
  ...props
}) {
  const baseStyles =
    "bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all";

  const variants = {
    default: "p-4",
    elevated: "p-6 shadow-lg",
    compact: "p-3",
  };

  const interactiveStyles =
    interactive || onClick
      ? "cursor-pointer hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:-translate-y-1"
      : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export function CardHeader({ children, className = "" }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

/**
 * Card Title
 */
export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

/**
 * Card Description
 */
export function CardDescription({ children, className = "" }) {
  return <p className={`text-sm text-purple-300 ${className}`}>{children}</p>;
}

/**
 * Card Content
 */
export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = "" }) {
  return (
    <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}
