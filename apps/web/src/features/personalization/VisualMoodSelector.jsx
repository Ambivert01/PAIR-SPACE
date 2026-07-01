import { VISUAL_MOODS } from "@shared/constants/themes.js";

export default function VisualMoodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {VISUAL_MOODS.map((m) => (
        <button key={m.value} onClick={() => onChange(m.value)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
            value === m.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/30" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]"
          }`}>
          <span className="text-xl">{m.emoji}</span>
          <span className={`text-[10px] ${value === m.value ? "text-white" : "text-[var(--text-tertiary)]"}`}>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
