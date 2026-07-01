import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listEntries } from "../features/journal/journalService.js";
import { JOURNAL_ENTRY_TYPES } from "@shared/constants/journalPrompts.js";
import JournalEntryCardUltra from "../features/journal/JournalEntryCardUltra.jsx";
import JournalEditorUltra from "../features/journal/JournalEditorUltra.jsx";
import JournalReaderUltra from "../features/journal/JournalReaderUltra.jsx";

export default function JournalPageUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading } = useRelationship();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [selected, setSelected] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);


  useEffect(() => {
    if (!rel) return;
    setLoading(true);
    const params = { limit: 20 };
    if (typeFilter) params.type = typeFilter;
    listEntries(rel.id, params)
      .then(({ entries: e, nextCursor: nc }) => {
        setEntries(e);
        setNextCursor(nc);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rel, typeFilter]);

  const updateEntry = (updated) =>
    setEntries((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e)),
    );

  const removeEntry = (id) =>
    setEntries((prev) => prev.filter((e) => e._id !== id));

  if (selected)
    return (
      <JournalReaderUltra
        entry={selected}
        currentUserId={currentUserId}
        onClose={() => setSelected(null)}
        onUpdated={updateEntry}
        onDeleted={removeEntry}
      />
    );

  if (showEditor && rel)
    return (
      <JournalEditorUltra
        relationshipId={rel.id}
        onCreated={(e) => setEntries((prev) => [e, ...prev])}
        onClose={() => setShowEditor(false)}
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] to-[#1c1c24] text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <motion.div
        className="hstack-md px-6 py-5 border-b border-[var(--glass-border)] sticky top-0 bg-gradient-to-br from-[#0f0f14]/90 to-[#1c1c24]/90 backdrop-blur-xl z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.button
          onClick={() => navigate("/relationship")}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <h1 className="text-lg font-light flex-1">Journal</h1>
        <motion.button
          onClick={() => setShowEditor(true)}
          className="btn-primary btn-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Write
        </motion.button>
      </motion.div>

      {/* Type filter */}
      <motion.div
        className="flex gap-2 overflow-x-auto px-6 py-4 border-b border-[var(--glass-border)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          onClick={() => setTypeFilter("")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs border transition-all ${
            !typeFilter
              ? "border-[var(--accent-dream)] bg-[var(--accent-dream)]/10 text-white"
              : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>
        {JOURNAL_ENTRY_TYPES.map((t, i) => (
          <motion.button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs border transition-all ${
              typeFilter === t.value
                ? "border-[var(--accent-dream)] bg-[var(--accent-dream)]/10 text-white"
                : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            {t.emoji} {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-6 py-6 stack-md relative z-0">
        {loading ? (
          <motion.div
            className="flex justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 stack-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              className="text-6xl"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              📓
            </motion.span>
            <p className="text-[var(--text-secondary)] text-base font-light">
              Start writing your story ❤️
            </p>
            <motion.button
              onClick={() => setShowEditor(true)}
              className="btn-primary btn-base mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Write first entry
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="stack-md"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {entries.map((e) => (
              <JournalEntryCardUltra
                key={e._id}
                entry={e}
                currentUserId={currentUserId}
                onClick={setSelected}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
