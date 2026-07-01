/**
 * Button Component
 *
 * Consistent button styles across the app
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 * States: loading, disabled
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all focus-ring disabled";

  const variants = {
    primary:
      "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg",
    secondary:
      "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30",
    ghost: "bg-transparent hover:bg-white/10 text-purple-300 hover:text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg",
    success:
      "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}

      {children}

      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
