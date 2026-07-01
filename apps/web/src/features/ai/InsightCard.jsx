const TYPE_ICON = {
  communication_slowdown:   "💬",
  frequent_late_replies:    "⏰",
  special_date_approaching: "📅",
  partner_stressed:         "💙",
  conversation_intensity:   "🔥",
  communication_imbalance:  "⚖️",
  milestone_reached:        "🎉",
  activity_suggestion:      "🎬",
  memory_highlight:         "📸",
  gratitude_reminder:       "🙏",
  celebration_reminder:     "🥳",
  habit_encouragement:      "🔥",
  weekly_summary:           "📊",
  icebreaker_suggestion:    "💬",
  appreciation_reminder:    "❤️",
};

export default function InsightCard({ insight, onDismiss }) {
  const icon = TYPE_ICON[insight.type] || "✨";

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div>
            <p className="text-sm font-medium text-white">{insight.title}</p>
            {insight.description && (
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{insight.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDismiss(insight._id)}
          className="text-gray-700 hover:text-[var(--text-secondary)] text-lg leading-none flex-shrink-0 transition-colors"
        >
          ×
        </button>
      </div>

      {insight.suggestion && (
        <div className="ml-8 bg-indigo-950/40 border border-indigo-900/50 rounded-xl px-3 py-2">
          <p className="text-xs text-[var(--accent-dream-soft)] italic">"{insight.suggestion}"</p>
        </div>
      )}
    </div>
  );
}
