import { useState } from "react";
import { updateStory } from "./storyService.js";
import StoryHighlightBlock from "./StoryHighlightBlock.jsx";

const TYPE_META = {
  monthly:     { emoji: "📅" },
  milestone:   { emoji: "🏁" },
  anniversary: { emoji: "🎉" },
  journey:     { emoji: "💑" },
  activity:    { emoji: "🎬" },
  growth:      { emoji: "🌱" },
  custom:      { emoji: "✨" },
};

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";

export default function StoryReader({ story: initial, onClose, onUpdated }) {
  const [story, setStory] = useState(initial);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(story.title);

  const patch = async (updates) => {
    const updated = await updateStory(story._id, updates).catch(() => null);
    if (updated) { setStory(updated); onUpdated?.(updated); }
  };

  const saveTitle = async () => {
    if (titleInput.trim()) await patch({ title: titleInput.trim() });
    setEditingTitle(false);
  };

  const { emoji } = TYPE_META[story.storyType] || TYPE_META.custom;

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 overflow-y-auto">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--bg-primary)] z-10">
        <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white transition-colors">←</button>
        <span className="text-xl">{emoji}</span>
        <p className="text-sm text-[var(--text-secondary)] capitalize flex-1">{story.storyType} story</p>
        <button onClick={() => patch({ favorited: !story.favorited })}
          className={`text-lg transition-colors ${story.favorited ? "text-[var(--status-error)]" : "text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"}`}>
          {story.favorited ? "❤️" : "🤍"}
        </button>
        <button onClick={() => patch({ hidden: true }).then(onClose)}
          className="text-gray-700 hover:text-[var(--text-secondary)] text-xs transition-colors">
          Hide
        </button>
      </div>

      {/* content */}
      <div className="max-w-lg mx-auto px-6 py-8 space-y-8">
        {/* title */}
        <div className="text-center space-y-2">
          {editingTitle ? (
            <div className="flex gap-2">
              <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)}
                className="flex-1 bg-[var(--glass-bg)] border border-[var(--accent-dream-soft)] rounded-xl px-4 py-2 text-white text-sm outline-none"
                autoFocus onKeyDown={(e) => e.key === "Enter" && saveTitle()} />
              <button onClick={saveTitle} className="gradient-mixed rounded-xl px-4 py-2 text-sm">Save</button>
            </div>
          ) : (
            <button onClick={() => setEditingTitle(true)} className="group">
              <h1 className="text-2xl font-semibold text-white leading-snug group-hover:text-[var(--accent-dream-soft)] transition-colors">
                {story.title}
              </h1>
              <p className="text-xs text-gray-700 mt-1">tap to edit title</p>
            </button>
          )}
          {story.periodStart && (
            <p className="text-xs text-[var(--text-tertiary)]">{fmt(story.periodStart)}</p>
          )}
        </div>

        {/* highlights */}
        <StoryHighlightBlock highlights={story.highlights} />

        {/* narrative */}
        <div className="space-y-4">
          <div className="w-8 h-0.5 bg-[var(--accent-dream)] mx-auto" />
          <p className="text-[var(--text-secondary)] text-base leading-loose text-center font-light">
            {story.narrative}
          </p>
          <div className="w-8 h-0.5 bg-[var(--accent-dream)] mx-auto" />
        </div>

        <p className="text-center text-xs text-gray-700">
          Generated {new Date(story.generatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
