import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { listStories, generateStory } from "../features/story/storyService.js";
import StoryTimeline from "../features/story/StoryTimeline.jsx";
import StoryReader from "../features/story/StoryReader.jsx";

const STORY_TYPES = [
  { value: "monthly",     label: "This Month",  emoji: "📅" },
  { value: "journey",     label: "Our Journey", emoji: "💑" },
  { value: "anniversary", label: "Anniversary", emoji: "🎉" },
];

export default function StoryPage() {
  const navigate = useNavigate();
  const { rel, loading: relLoading } = useRelationship();
  const [stories, setStories]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [generating, setGen]    = useState(false);
  const [genError, setGenError] = useState("");
  const [selected, setSelected] = useState(null);


  useEffect(() => {
    if (!rel) return;
    listStories(rel.id)
      .then(({ stories: s }) => setStories(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rel]);

  const handleGenerate = async (type) => {
    setGen(true); setGenError("");
    try {
      const story = await generateStory(rel.id, type);
      setStories((prev) => [story, ...prev]);
      setSelected(story);
    } catch (err) {
      setGenError(err.response?.data?.message || "Not enough data yet. Keep building your story!");
    } finally { setGen(false); }
  };

  const handleUpdated = (updated) =>
    setStories((prev) => prev.map((s) => s._id === updated._id ? updated : s));

  if (selected)
    return <StoryReader story={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--bg-primary)] z-10">
        <button onClick={() => navigate("/relationship")} className="text-[var(--text-tertiary)] hover:text-white transition-colors">←</button>
        <h1 className="text-base font-semibold flex-1">Our Story</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Generate a story</p>
          <div className="flex gap-2 flex-wrap">
            {STORY_TYPES.map((t) => (
              <button key={t.value} onClick={() => handleGenerate(t.value)} disabled={generating}
                className="flex items-center gap-2 bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] hover:border-[var(--accent-dream-soft)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-all disabled:opacity-50">
                <span>{t.emoji}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
          {generating && <p className="text-xs text-[var(--accent-dream-soft)] animate-pulse">Writing your story...</p>}
          {genError && <p className="text-xs text-yellow-500">{genError}</p>}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <span className="text-5xl">📖</span>
            <p className="text-[var(--text-tertiary)] text-sm text-center">Your story hasn't been written yet.</p>
            <p className="text-gray-700 text-xs text-center">Generate your first story above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Your stories</p>
            <StoryTimeline stories={stories} onSelect={setSelected} />
          </div>
        )}
      </div>
    </div>
  );
}
