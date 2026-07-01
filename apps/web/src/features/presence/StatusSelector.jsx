import { useState } from "react";

const STATUSES = [
  { value: "online",         label: "Online",          emoji: "🟢" },
  { value: "busy",           label: "Busy",            emoji: "🔴" },
  { value: "studying",       label: "Studying",        emoji: "📚" },
  { value: "working",        label: "Working",         emoji: "💼" },
  { value: "sleeping",       label: "Sleeping",        emoji: "😴" },
  { value: "do_not_disturb", label: "Do not disturb",  emoji: "🔕" },
  { value: "traveling",      label: "Traveling",       emoji: "✈️" },
  { value: "commuting",      label: "Commuting",       emoji: "🚌" },
];

export default function StatusSelector({ currentStatus, onSelect, onClose }) {
  const [customMsg, setCustomMsg] = useState("");

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-xl w-64">
      <div className="px-4 py-3 border-b border-[var(--glass-border)]">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Set your status</p>
      </div>

      <div className="py-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { onSelect(s.value, customMsg); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--glass-bg-strong)] transition-colors ${
              currentStatus === s.value ? "text-white" : "text-[var(--text-secondary)]"
            }`}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
            {currentStatus === s.value && <span className="ml-auto text-[var(--accent-dream-soft)] text-xs">✓</span>}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-[var(--glass-border)]">
        <input
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value.slice(0, 60))}
          placeholder="Custom message (optional)"
          className="w-full bg-[var(--glass-bg-strong)] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
