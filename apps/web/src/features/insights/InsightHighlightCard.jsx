const TYPE_ICON = {
  communication_frequency:   "💬",
  conversation_balance:      "⚖️",
  response_time_pattern:     "⏱️",
  shared_activity_frequency: "🎬",
  memory_creation_frequency: "📸",
  habit_consistency:         "🔥",
  planner_alignment:         "📅",
  call_frequency:            "📞",
  positivity_trend:          "💕",
  engagement_trend:          "🎮",
  milestone_progress:        "🏁",
  shared_time_estimation:    "⏳",
};

const TREND_ICON = { up: "↑", down: "↓", neutral: "→" };
const TREND_COLOR = { up: "text-[var(--status-success)]", down: "text-[var(--status-error)]", neutral: "text-[var(--text-tertiary)]" };

export default function InsightHighlightCard({ insight }) {
  const icon  = TYPE_ICON[insight.insightType] || "✨";
  const trend = insight.trend || "neutral";

  return (
    <div className="bg-[var(--glass-bg)] rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div>
            <p className="text-sm font-medium text-white">{insight.title}</p>
            {insight.description && (
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-relaxed">{insight.description}</p>
            )}
          </div>
        </div>
        <span className={`text-sm font-bold flex-shrink-0 ${TREND_COLOR[trend]}`}>
          {TREND_ICON[trend]}
        </span>
      </div>

      {/* score bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-[var(--glass-bg-strong)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${insight.score}%`,
              backgroundColor: insight.score >= 70 ? "#22c55e" : insight.score >= 45 ? "#6366f1" : "#f59e0b",
            }}
          />
        </div>
      </div>
    </div>
  );
}
