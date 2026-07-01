import { CHAT_BUBBLE_STYLES } from "@shared/constants/themes.js";

export default function ChatStylePreview({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {CHAT_BUBBLE_STYLES.map((s) => (
          <button key={s.value} onClick={() => onChange(s.value)}
            className={`px-3 py-1.5 text-xs border rounded-full transition-colors capitalize ${
              value === s.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/30 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* live preview */}
      <div className="bg-[var(--glass-bg)] rounded-2xl p-4 space-y-2">
        <div className="flex justify-start">
          <div className="bg-[var(--glass-bg-strong)] text-[var(--text-primary)] px-4 py-2 text-sm max-w-[70%]"
            style={{ borderRadius: CHAT_BUBBLE_STYLES.find((s) => s.value === value)?.radius || "1.25rem" }}>
            Hey, thinking of you 💕
          </div>
        </div>
        <div className="flex justify-end">
          <div className="gradient-mixed text-white px-4 py-2 text-sm max-w-[70%]"
            style={{ borderRadius: CHAT_BUBBLE_STYLES.find((s) => s.value === value)?.radius || "1.25rem" }}>
            Miss you so much ❤️
          </div>
        </div>
      </div>
    </div>
  );
}
