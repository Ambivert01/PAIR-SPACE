const THEMES = [
  { value: "dark",     label: "Dark",     preview: "bg-[var(--bg-primary)] border-[var(--glass-border)]" },
  { value: "light",    label: "Light",    preview: "bg-gray-100 border-gray-300" },
  { value: "romantic", label: "Romantic", preview: "bg-rose-950 border-rose-700" },
  { value: "minimal",  label: "Minimal",  preview: "bg-zinc-900 border-zinc-600" },
];

const ACCENTS = [
  { value: "indigo",  label: "Indigo",  color: "bg-[var(--accent-dream)]" },
  { value: "purple",  label: "Purple",  color: "bg-purple-500" },
  { value: "pink",    label: "Pink",    color: "bg-pink-500"   },
  { value: "neutral", label: "Neutral", color: "bg-gray-500"   },
];

export default function ThemeSelector({ appearance, onUpdate }) {
  return (
    <div className="space-y-5 py-2">
      <div>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button key={t.value} onClick={() => onUpdate("theme", t.value)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                appearance?.theme === t.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/20" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]"
              }`}>
              <div className={`w-8 h-8 rounded-lg border ${t.preview}`} />
              <span className="text-sm text-[var(--text-secondary)]">{t.label}</span>
              {appearance?.theme === t.value && <span className="ml-auto text-[var(--accent-dream-soft)] text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Accent Color</p>
        <div className="flex gap-3">
          {ACCENTS.map((a) => (
            <button key={a.value} onClick={() => onUpdate("accentColor", a.value)} title={a.label}
              className={`w-10 h-10 rounded-full ${a.color} transition-all ${
                appearance?.accentColor === a.value ? "ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110" : "opacity-70 hover:opacity-100"
              }`} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Animations</p>
        <div className="flex gap-2">
          {["normal","reduced","disabled"].map((a) => (
            <button key={a} onClick={() => onUpdate("animationLevel", a)}
              className={`flex-1 py-2 rounded-xl text-xs border capitalize transition-colors ${
                appearance?.animationLevel === a ? "border-[var(--accent-dream-soft)] bg-indigo-900/30 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"
              }`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
