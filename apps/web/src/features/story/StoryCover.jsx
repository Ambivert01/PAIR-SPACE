const TYPE_META = {
  monthly:     { emoji: "📅", gradient: "from-indigo-900/60 to-purple-900/60" },
  milestone:   { emoji: "🏁", gradient: "from-amber-900/60 to-orange-900/60"  },
  anniversary: { emoji: "🎉", gradient: "from-rose-900/60 to-pink-900/60"     },
  journey:     { emoji: "💑", gradient: "from-teal-900/60 to-[var(--bg-tertiary)]/60"   },
  activity:    { emoji: "🎬", gradient: "from-blue-900/60 to-[var(--bg-tertiary)]/60"   },
  growth:      { emoji: "🌱", gradient: "from-green-900/60 to-teal-900/60"    },
  custom:      { emoji: "✨", gradient: "from-[var(--bg-primary)]/60 to-pink-900/60"   },
};

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";

export default function StoryCover({ story, onClick }) {
  const { emoji, gradient } = TYPE_META[story.storyType] || TYPE_META.custom;

  return (
    <button
      onClick={() => onClick(story)}
      className={`w-full bg-gradient-to-br ${gradient} border border-[var(--glass-border)] rounded-2xl p-5 text-left space-y-3 hover:border-[var(--glass-border-strong)] transition-all`}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{emoji}</span>
        <div className="flex items-center gap-2">
          {story.favorited && <span className="text-[var(--status-error)] text-sm">❤️</span>}
          <span className="text-xs text-[var(--text-tertiary)] capitalize">{story.storyType}</span>
        </div>
      </div>
      <div>
        <p className="text-base font-semibold text-white leading-snug">{story.title}</p>
        {story.periodStart && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{fmt(story.periodStart)} — {fmt(story.periodEnd)}</p>
        )}
      </div>
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{story.narrative}</p>
    </button>
  );
}
