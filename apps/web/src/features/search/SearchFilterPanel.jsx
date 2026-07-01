const TYPES = [
  { value: "",          label: "All",       emoji: "🔍" },
  { value: "messages",  label: "Messages",  emoji: "💬" },
  { value: "memories",  label: "Memories",  emoji: "📸" },
  { value: "plans",     label: "Plans",     emoji: "📅" },
  { value: "activities",label: "Activities",emoji: "🎬" },
  { value: "files",     label: "Files",     emoji: "📎" },
  { value: "games",     label: "Games",     emoji: "🎮" },
];

export default function SearchFilterPanel({ filters, onChange }) {
  return (
    <div className="px-4 py-3 border-b border-[var(--glass-border)] space-y-3 bg-[var(--bg-primary)]">
      {/* type chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => onChange({ ...filters, type: t.value })}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filters.type === t.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/40 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"
            }`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* date range */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="text-xs text-[var(--text-disabled)] mb-1">From</p>
          <input type="date" value={filters.dateFrom || ""}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent-dream-soft)]" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-disabled)] mb-1">To</p>
          <input type="date" value={filters.dateTo || ""}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent-dream-soft)]" />
        </div>
        {(filters.dateFrom || filters.dateTo) && (
          <button onClick={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
            className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-secondary)] mt-4 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
