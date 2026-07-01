export default function StoryHighlightBlock({ highlights = [] }) {
  if (!highlights.length) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {highlights.slice(0, 6).map((h, i) => (
        <div key={i} className="bg-[var(--glass-bg-strong)]/60 rounded-xl p-3 text-center space-y-1">
          <span className="text-xl">{h.icon}</span>
          <p className="text-base font-bold text-white">{h.value}</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">{h.label}</p>
        </div>
      ))}
    </div>
  );
}
