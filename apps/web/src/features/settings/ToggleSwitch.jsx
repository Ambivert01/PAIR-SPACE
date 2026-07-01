export default function ToggleSwitch({ value, onChange, disabled = false, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-4">
        {label && <p className="text-sm text-[var(--text-secondary)]">{label}</p>}
        {description && <p className="text-xs text-[var(--text-disabled)] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
        } ${value ? "gradient-mixed" : "bg-[var(--glass-bg-strong)]"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
