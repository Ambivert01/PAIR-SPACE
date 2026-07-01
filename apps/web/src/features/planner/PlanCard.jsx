import ProgressBar from "./ProgressBar.jsx";

const TYPE_META = {
  event:          { emoji: "📅", color: "text-[var(--status-info)]"   },
  reminder:       { emoji: "⏰", color: "text-[var(--status-warning)]" },
  goal:           { emoji: "🎯", color: "text-[var(--accent-dream-soft)]" },
  habit:          { emoji: "🔥", color: "text-orange-400" },
  routine:        { emoji: "🔄", color: "text-[var(--status-success)]"  },
  task:           { emoji: "✅", color: "text-teal-400"   },
  milestone_plan: { emoji: "🏁", color: "text-[var(--accent-dream-soft)]" },
  trip_plan:      { emoji: "✈️", color: "text-cyan-400"   },
  study_plan:     { emoji: "📚", color: "text-[var(--accent-love-soft)]"   },
  health_plan:    { emoji: "💪", color: "text-[var(--status-error)]"    },
  custom_plan:    { emoji: "💫", color: "text-[var(--text-secondary)]"   },
};

const PRIORITY_COLOR = {
  low: "text-[var(--text-disabled)]", medium: "text-[var(--status-info)]",
  high: "text-orange-400", important: "text-[var(--status-error)]",
};

const STATUS_BADGE = {
  pending:   "bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]",
  active:    "bg-indigo-900/50 text-[var(--accent-dream-soft)]",
  completed: "bg-green-900/50 text-[var(--status-success)]",
  cancelled: "bg-[var(--glass-bg-strong)] text-[var(--text-disabled)]",
  missed:    "bg-red-900/50 text-[var(--status-error)]",
  paused:    "bg-yellow-900/50 text-[var(--status-warning)]",
};

export default function PlanCard({ plan, onClick, onComplete, onDelete }) {
  const { emoji, color } = TYPE_META[plan.type] || TYPE_META.custom_plan;
  const isHabit = plan.type === "habit";
  const isGoal  = plan.type === "goal";
  const hasChecklist = plan.checklist?.length > 0;

  const dueDate = plan.dueDate || plan.startDate;
  const dateStr = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  const isOverdue = dueDate && new Date(dueDate) < new Date() && plan.status !== "completed";

  return (
    <div
      onClick={() => onClick(plan)}
      className="bg-[var(--glass-bg)] rounded-2xl p-4 space-y-3 cursor-pointer hover:bg-[var(--glass-bg-strong)]/80 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className={`text-xl flex-shrink-0 ${color}`}>{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium text-white truncate ${plan.status === "completed" ? "line-through opacity-50" : ""}`}>
              {plan.title}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[plan.status] || STATUS_BADGE.pending}`}>
              {plan.status}
            </span>
          </div>
          {plan.description && (
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">{plan.description}</p>
          )}
        </div>
        <span className={`text-xs flex-shrink-0 ${PRIORITY_COLOR[plan.priority]}`}>
          {plan.priority === "important" ? "❗" : plan.priority === "high" ? "↑" : ""}
        </span>
      </div>

      {/* progress for goals */}
      {(isGoal || hasChecklist) && plan.status !== "completed" && (
        <ProgressBar value={plan.progress} />
      )}

      {/* habit streak */}
      {isHabit && (
        <div className="flex items-center gap-2">
          <span className="text-sm">🔥</span>
          <span className="text-xs text-orange-400 font-medium">{plan.streakCount} day streak</span>
          {plan.longestStreak > 0 && (
            <span className="text-xs text-[var(--text-disabled)]">· best {plan.longestStreak}</span>
          )}
        </div>
      )}

      {/* footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dateStr && (
            <span className={`text-xs ${isOverdue ? "text-[var(--status-error)]" : "text-[var(--text-disabled)]"}`}>
              {isOverdue ? "⚠️ " : ""}{dateStr}
            </span>
          )}
          {plan.recurrence !== "none" && (
            <span className="text-xs text-gray-700">🔄 {plan.recurrence}</span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isHabit && plan.status !== "completed" && (
            <button
              onClick={() => onComplete(plan._id)}
              className="text-xs bg-orange-900/40 hover:bg-orange-900/70 text-orange-300 px-2.5 py-1 rounded-lg transition-colors"
            >
              Done today
            </button>
          )}
          {!isHabit && plan.status === "pending" && (
            <button
              onClick={() => onComplete(plan._id)}
              className="text-xs bg-green-900/40 hover:bg-green-900/70 text-green-300 px-2.5 py-1 rounded-lg transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
