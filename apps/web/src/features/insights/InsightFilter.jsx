const PERIODS = [
  { value: "weekly",  label: "This Week" },
  { value: "monthly", label: "This Month" },
];

const TYPES = [
  { value: "",                          label: "All" },
  { value: "communication_frequency",   label: "Chat" },
  { value: "shared_activity_frequency", label: "Activities" },
  { value: "memory_creation_frequency", label: "Memories" },
  { value: "positivity_trend",          label: "Mood" },
  { value: "shared_time_estimation",    label: "Time" },
];

export default function InsightFilter({ filters, onChange }) {
  return (
    <div className="space-y-2 px-4 py-3 border-b border-[var(--glass-border)]">
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => onChange({ ...filters, period: p.value })}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filters.period === p.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/40 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
            }`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => onChange({ ...filters, type: t.value })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filters.type === t.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/40 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
