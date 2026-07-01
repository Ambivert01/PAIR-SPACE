import SearchResultItem from "./SearchResultItem.jsx";

const SECTION_META = {
  messages:   { label: "Messages",   emoji: "💬" },
  memories:   { label: "Memories",   emoji: "📸" },
  plans:      { label: "Plans",      emoji: "📅" },
  activities: { label: "Activities", emoji: "🎬" },
  files:      { label: "Files",      emoji: "📎" },
  games:      { label: "Games",      emoji: "🎮" },
};

export default function SearchResultSection({ type, items, query, onMemoryOpen }) {
  if (!items?.length) return null;
  const { label, emoji } = SECTION_META[type] || { label: type, emoji: "🔍" };

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)]/50">
        <span className="text-sm">{emoji}</span>
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{label}</p>
        <span className="text-xs text-gray-700 ml-auto">{items.length}</span>
      </div>
      <div className="divide-y divide-gray-800/50">
        {items.map((item, i) => (
          <SearchResultItem key={item._id || i} item={item} type={type} query={query} onMemoryOpen={onMemoryOpen} />
        ))}
      </div>
    </div>
  );
}
