import { useState } from "react";

const TYPE_ICON = {
  appreciation: "❤️", icebreaker: "💬", deep: "🌊",
  fun: "🎉", gratitude: "🙏", check_in: "💙",
  memory: "📸", future: "✨",
};

export default function SuggestionCard({ suggestion, onUse }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex items-center gap-3">
      <span className="text-lg flex-shrink-0">{TYPE_ICON[suggestion.type] || "💬"}</span>
      <p className="flex-1 text-xs text-[var(--text-secondary)] italic">"{suggestion.text}"</p>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-secondary)] transition-colors"
          title="Copy"
        >
          {copied ? "✓" : "📋"}
        </button>
        {onUse && (
          <button
            onClick={() => onUse(suggestion.text)}
            className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-soft)] transition-colors"
            title="Use in chat"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
