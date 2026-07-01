/**
 * Input Component
 *
 * Consistent input field styles
 * States: default, focus, error, disabled
 * Supports: label, helper text, error message, icons
 */

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = "",
  ...props
}) {
  const baseStyles =
    "bg-white/10 backdrop-blur-sm border rounded-xl px-4 py-2.5 text-white placeholder-purple-300 outline-none transition-colors";
  const focusStyles =
    "focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20";
  const errorStyles = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
    : "border-white/20";
  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <div className={widthClass}>
      {label && (
        <label className="block text-sm font-medium text-purple-200 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300">
            {leftIcon}
          </div>
        )}

        <input
          className={`${baseStyles} ${focusStyles} ${errorStyles} ${disabledStyles} ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-[var(--status-error)]">{error}</p>}

      {!error && helperText && (
        <p className="mt-1.5 text-sm text-purple-300">{helperText}</p>
      )}
    </div>
  );
}
