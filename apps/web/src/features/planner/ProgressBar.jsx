export default function ProgressBar({ value = 0, color = "bg-[var(--accent-dream)]", showLabel = true }) {
  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-[var(--glass-bg-strong)] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--text-disabled)] text-right">{value}%</p>
      )}
    </div>
  );
}
