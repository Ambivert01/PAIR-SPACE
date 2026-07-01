export default function HabitTracker({ habits, onComplete }) {
  if (!habits.length)
    return <p className="text-xs text-gray-700 text-center py-4">No habits yet. Add one!</p>;

  return (
    <div className="space-y-2">
      {habits.map((h) => {
        const today = new Date().toDateString();
        const doneToday = h.habitLogs?.some((l) => {
          return new Date(l.date).toDateString() === today && l.completed;
        });

        return (
          <div key={h._id} className="flex items-center gap-3 bg-[var(--glass-bg)] rounded-xl p-3">
            <span className="text-xl">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{h.title}</p>
              <p className="text-xs text-orange-400">{h.streakCount} day streak · best {h.longestStreak}</p>
            </div>
            <button
              onClick={() => !doneToday && onComplete(h._id)}
              disabled={doneToday}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                doneToday
                  ? "bg-green-900/40 text-[var(--status-success)] cursor-default"
                  : "bg-orange-900/40 hover:bg-orange-900/70 text-orange-300"
              }`}
            >
              {doneToday ? "✓ Done" : "Mark done"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
