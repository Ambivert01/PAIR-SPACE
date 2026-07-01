import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listEntries } from "../features/journal/journalService.js";
import { JOURNAL_ENTRY_TYPES } from "@shared/constants/journalPrompts.js";
import JournalEntryCardUltra from "../features/journal/JournalEntryCardUltra.jsx";
import JournalEditorUltra from "../features/journal/JournalEditorUltra.jsx";
import JournalReaderUltra from "../features/journal/JournalReaderUltra.jsx";
import PageLayout, { PageSpinner, PageEmpty, HeaderButton } from "../components/PageLayout.jsx";

export default function JournalPageUltra() {
  const currentUserId = useCurrentUserId();
  const { rel } = useRelationship();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!rel) return;
    setLoading(true);
    const params = { limit: 20 };
    if (typeFilter) params.type = typeFilter;
    listEntries(rel.id, params).then(({ entries: e }) => setEntries(e)).catch(() => {}).finally(() => setLoading(false));
  }, [rel, typeFilter]);

  const updateEntry = (updated) => setEntries(prev => prev.map(e => e._id === updated._id ? updated : e));
  const removeEntry = (id) => setEntries(prev => prev.filter(e => e._id !== id));

  if (selected) return <JournalReaderUltra entry={selected} currentUserId={currentUserId} onClose={() => setSelected(null)} onUpdated={updateEntry} onDeleted={removeEntry} />;
  if (showEditor && rel) return <JournalEditorUltra relationshipId={rel.id} onCreated={e => setEntries(prev => [e, ...prev])} onClose={() => setShowEditor(false)} />;

  return (
    <PageLayout
      title="Journal"
      subtitle="Shared reflections & letters"
      icon="📓"
      accent="dream"
      headerRight={<HeaderButton onClick={() => setShowEditor(true)}>+ Write</HeaderButton>}
      noPad
    >
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--bg-primary)]/80 backdrop-blur-sm" style={{ scrollbarWidth: "none" }}>
          <motion.button onClick={() => setTypeFilter("")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all ${!typeFilter ? "border-[var(--accent-dream)] bg-[var(--accent-dream)]/15 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"}`}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            All
          </motion.button>
          {JOURNAL_ENTRY_TYPES.map((t, i) => (
            <motion.button key={t.value} onClick={() => setTypeFilter(t.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${typeFilter === t.value ? "border-[var(--accent-dream)] bg-[var(--accent-dream)]/15 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"}`}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
              {t.emoji} {t.label}
            </motion.button>
          ))}
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? <PageSpinner label="Loading journal..." /> :
           entries.length === 0 ? (
            <PageEmpty icon="📓" title="Start writing your story" desc="Journal entries are private until you choose to share them." action="Write first entry" onAction={() => setShowEditor(true)} />
           ) : (
            <motion.div className="space-y-3" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show">
              {entries.map(e => <JournalEntryCardUltra key={e._id} entry={e} currentUserId={currentUserId} onClick={setSelected} />)}
            </motion.div>
           )}
        </div>
      </div>
    </PageLayout>
  );
}
