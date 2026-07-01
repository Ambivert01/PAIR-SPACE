import { FONT_STYLES } from "@shared/constants/themes.js";

export default function FontSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      {FONT_STYLES.map((f) => (
        <button key={f.value} onClick={() => onChange(f.value)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            value === f.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/20" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]"
          }`}>
          <span className="text-sm text-[var(--text-secondary)]">{f.label}</span>
          <span style={{ fontFamily: f.family }} className="text-sm text-[var(--text-secondary)]">
            Hello, my love ❤️
          </span>
          {value === f.value && <span className="text-[var(--accent-dream-soft)] text-xs ml-2">✓</span>}
        </button>
      ))}
    </div>
  );
}
