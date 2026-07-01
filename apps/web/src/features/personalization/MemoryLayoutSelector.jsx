import { MEMORY_LAYOUTS } from "@shared/constants/themes.js";

export default function MemoryLayoutSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MEMORY_LAYOUTS.map((l) => (
        <button key={l.value} onClick={() => onChange(l.value)}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
            value === l.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/30" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]"
          }`}>
          <span className="text-2xl">{l.emoji}</span>
          <span className={`text-[10px] text-center ${value === l.value ? "text-white" : "text-[var(--text-tertiary)]"}`}>{l.label}</span>
        </button>
      ))}
    </div>
  );
}
