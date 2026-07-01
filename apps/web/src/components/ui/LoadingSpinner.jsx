/**
 * Loading Spinner Component
 *
 * Consistent loading indicators
 * Sizes: sm, md, lg
 * Variants: spinner, dots, pulse
 */

export default function LoadingSpinner({
  size = "md",
  variant = "spinner",
  className = "",
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  if (variant === "spinner") {
    return (
      <svg
        className={`animate-spin ${sizes[size]} ${className}`}
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
    );
  }

  if (variant === "dots") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={`${sizes[size]} bg-purple-500 rounded-full animate-pulse ${className}`}
      />
    );
  }

  return null;
}

/**
 * Full Page Loading
 */
export function LoadingPage({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      <LoadingSpinner size="lg" className="text-white mb-4" />
      <p className="text-purple-200 text-sm">{message}</p>
    </div>
  );
}

/**
 * Loading Overlay
 */
export function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50 rounded-xl">
      <LoadingSpinner size="lg" className="text-white mb-4" />
      <p className="text-white text-sm">{message}</p>
    </div>
  );
}
