import StoryCover from "./StoryCover.jsx";

export default function StoryTimeline({ stories, onSelect }) {
  if (!stories.length) return null;

  // group by year
  const grouped = {};
  for (const s of stories) {
    const year = new Date(s.generatedAt).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(s);
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).sort(([a], [b]) => b - a).map(([year, yearStories]) => (
        <div key={year} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--glass-bg-strong)]" />
            <p className="text-xs text-[var(--text-disabled)] font-medium">{year}</p>
            <div className="h-px flex-1 bg-[var(--glass-bg-strong)]" />
          </div>
          {yearStories.map((s) => (
            <StoryCover key={s._id} story={s} onClick={onSelect} />
          ))}
        </div>
      ))}
    </div>
  );
}
