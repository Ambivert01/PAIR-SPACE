import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { listStories, generateStory } from "../features/story/storyService.js";
import StoryTimeline from "../features/story/StoryTimeline.jsx";
import StoryReader from "../features/story/StoryReader.jsx";
import PageLayout, { PageSpinner, PageEmpty, SectionLabel } from "../components/PageLayout.jsx";

const STORY_TYPES = [
  { value: "monthly",     label: "This Month",  emoji: "📅", color: "var(--accent-dream)" },
  { value: "journey",     label: "Our Journey", emoji: "💑", color: "var(--accent-love)" },
  { value: "anniversary", label: "Anniversary", emoji: "🎉", color: "var(--accent-glow)" },
];

export default function StoryPage() {
  const { rel } = useRelationship();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGen] = useState(false);
  const [genError, setGenError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!rel) return;
    listStories(rel.id).then(({ stories: s }) => setStories(s)).catch(() => {}).finally(() => setLoading(false));
  }, [rel]);

  const handleGenerate = async (type) => {
    setGen(true); setGenError("");
    try {
      const story = await generateStory(rel.id, type);
      setStories(prev => [story, ...prev]);
      setSelected(story);
    } catch (err) {
      setGenError(err.response?.data?.message || "Not enough data yet. Keep building your story!");
    } finally { setGen(false); }
  };

  const handleUpdated = (updated) => setStories(prev => prev.map(s => s._id === updated._id ? updated : s));

  if (selected) return <StoryReader story={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />;

  return (
    <PageLayout title="Our Story" subtitle="AI-generated relationship narratives" icon="📖" accent="glow">
      <div className="overflow-y-auto px-4 py-5 space-y-6">
        {/* Generate section */}
        <div className="card-glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)]/10 to-[var(--accent-dream)]/10 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-sm font-semibold text-white">Generate a story</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">AI writes your relationship narrative</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {STORY_TYPES.map(t => (
                <motion.button key={t.value} onClick={() => handleGenerate(t.value)} disabled={generating}
                  className="flex items-center gap-2 glass hover:bg-white/10 border border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-all disabled:opacity-50 font-medium"
                  whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <span>{t.emoji}</span><span>{t.label}</span>
                </motion.button>
              ))}
            </div>
            {generating && (
              <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="w-4 h-4 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <p className="text-xs text-[var(--accent-dream-soft)]">Writing your story...</p>
              </motion.div>
            )}
            {genError && <p className="text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-3 py-2">{genError}</p>}
          </div>
        </div>

        {/* Stories list */}
        {loading ? <PageSpinner label="Loading stories..." /> :
         stories.length === 0 ? (
          <PageEmpty icon="📖" title="Your story hasn't been written yet" desc="Generate your first story above to see your relationship narrative." />
         ) : (
          <div className="space-y-3">
            <SectionLabel>Your stories</SectionLabel>
            <StoryTimeline stories={stories} onSelect={setSelected} />
          </div>
         )}
      </div>
    </PageLayout>
  );
}
