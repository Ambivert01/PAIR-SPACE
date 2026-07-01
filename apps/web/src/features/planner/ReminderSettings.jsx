const TIMES = [
  { value: "10_minutes_before", label: "10 min before" },
  { value: "1_hour_before",     label: "1 hour before" },
  { value: "1_day_before",      label: "1 day before"  },
];

export default function ReminderSettings({ value = {}, onChange }) {
  const enabled = value.enabled || false;
  const times   = value.reminderTimes || [];

  const toggleTime = (t) => {
    const next = times.includes(t) ? times.filter((x) => x !== t) : [...times, t];
    onChange({ ...value, reminderTimes: next });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => onChange({ ...value, enabled: !enabled })}
          className={`w-10 h-5 rounded-full transition-colors relative ${enabled ? "gradient-mixed" : "bg-[var(--glass-bg-strong)]"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? "left-5" : "left-0.5"}`} />
        </div>
        <span className="text-sm text-[var(--text-secondary)]">Enable reminder</span>
      </label>

      {enabled && (
        <div className="space-y-2 pl-2">
          {TIMES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={times.includes(t.value)}
                onChange={() => toggleTime(t.value)}
                className="accent-indigo-500"
              />
              <span className="text-sm text-[var(--text-secondary)]">{t.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
