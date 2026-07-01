import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  JOURNAL_ENTRY_TYPES,
  JOURNAL_VISIBILITY,
} from "@shared/constants/journalPrompts.js";
import { EMOTION_TAGS, EMOTION_META } from "@shared/constants/memoryTypes.js";
import { createEntry } from "./journalService.js";
import JournalPromptSelectorUltra from "./JournalPromptSelectorUltra.jsx";

const DRAFT_KEY = "pairspace_journal_draft";

export default function JournalEditorUltra({
  relationshipId,
  onCreated,
  onClose,
}) {
  const [step, setStep] = useState(1); // 1=type, 2=write
  const [form, setForm] = useState({
    type: "",
    title: "",
    content: "",
    emotionTag: "calm",
    visibility: "shared",
    scheduledOpenDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // autosave draft with debounce
  useEffect(() => {
    if (form.content) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }, 2000);
    }
  }, [form]);

  // restore draft
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.content) setForm(saved);
    } catch {}
  }, []);

  // auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [form.content]);

  const handlePromptSelect = (prompt) => {
    set("content", prompt + "\n\n");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return setError("Write something first");
    setLoading(true);
    setError("");
    try {
      const entry = await createEntry({
        relationshipId,
        type: form.type,
        title: form.title,
        content: form.content,
        emotionTag: form.emotionTag,
        visibility: form.visibility,
        scheduledOpenDate: form.scheduledOpenDate || undefined,
      });
      localStorage.removeItem(DRAFT_KEY);
      onCreated(entry);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = JOURNAL_ENTRY_TYPES.find((t) => t.value === form.type);
  const isFutureLetter = form.type === "future_letter";

  // Step 1: Type selection
  if (step === 1)
    return (
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-[#0f0f14] to-[#1c1c24] z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--glass-border)]">
          <motion.p
            className="text-base font-light text-[var(--text-primary)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            What would you like to write?
          </motion.p>
          <motion.button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-2xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {JOURNAL_ENTRY_TYPES.map((t, i) => (
              <motion.button
                key={t.value}
                onClick={() => {
                  set("type", t.value);
                  setStep(2);
                }}
                className="glass p-6 rounded-2xl shadow-soft hover:shadow-glow-dream border border-[var(--glass-border)] hover:border-[var(--accent-dream)] transition-all flex flex-col items-center gap-3"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl">{t.emoji}</span>
                <span className="text-sm text-[var(--text-secondary)] text-center font-light">
                  {t.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>
    );

  // Step 2: Writing
  return (
    <motion.div
      className={`fixed inset-0 bg-gradient-to-br from-[#0f0f14] to-[#1c1c24] z-50 flex flex-col ${
        focusMode ? "bg-[#0a0a0f]" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className={`hstack-md px-6 py-4 border-b border-[var(--glass-border)] ${
          focusMode
            ? "opacity-0 hover:opacity-100 transition-opacity duration-300"
            : ""
        }`}
      >
        <motion.button
          onClick={() => setStep(1)}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <span className="text-2xl">{selectedType?.emoji}</span>
        <p className="text-sm text-[var(--text-secondary)] flex-1 font-light">
          {selectedType?.label}
        </p>

        {/* Saved indicator */}
        <AnimatePresence>
          {saved && (
            <motion.span
              className="text-xs text-[var(--accent-dream)] flex items-center gap-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              ✓ Saved
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setFocusMode((v) => !v)}
          title="Focus mode"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {focusMode ? "Exit focus" : "Focus"}
        </motion.button>
        <motion.button
          onClick={onClose}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-2xl transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 py-8 stack-lg max-w-3xl mx-auto w-full">
          {/* Title */}
          <motion.input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-transparent text-2xl font-light text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none border-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          />

          {/* Prompt selector */}
          <JournalPromptSelectorUltra
            entryType={form.type}
            onSelect={handlePromptSelect}
          />

          {/* Content - The main writing area */}
          <motion.textarea
            ref={textareaRef}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="What's on your mind today…"
            maxLength={10000}
            className="w-full bg-transparent text-[var(--text-primary)] text-lg leading-relaxed placeholder-[var(--text-tertiary)] outline-none resize-none min-h-[400px] font-light"
            style={{ lineHeight: "1.7" }}
            autoFocus
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          {/* Emotion tags */}
          <motion.div
            className="stack-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-light">
              How does this feel?
            </p>
            <div className="flex gap-2 flex-wrap">
              {EMOTION_TAGS.slice(0, 8).map((tag) => {
                const { emoji, color } = EMOTION_META[tag];
                return (
                  <motion.button
                    key={tag}
                    type="button"
                    onClick={() => set("emotionTag", tag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      form.emotionTag === tag
                        ? `border-[var(--accent-dream)] bg-[var(--accent-dream)]/10 ${color}`
                        : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {emoji} {tag}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Visibility */}
          <motion.div
            className="stack-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-light">
              Visibility
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {JOURNAL_VISIBILITY.map((v) => (
                <motion.button
                  key={v.value}
                  type="button"
                  onClick={() => set("visibility", v.value)}
                  className={`text-left p-4 rounded-xl border text-xs transition-all ${
                    form.visibility === v.value
                      ? "border-[var(--accent-dream)] bg-[var(--accent-dream)]/5 text-[var(--text-primary)]"
                      : "border-[var(--glass-border)] text-[var(--text-secondary)]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-medium">{v.label}</p>
                  <p className="text-[var(--text-tertiary)] mt-1 font-light">
                    {v.desc}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Scheduled date for future letter */}
          {(isFutureLetter || form.visibility === "visible_after_date") && (
            <motion.div
              className="stack-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-light">
                Open on date
              </p>
              <input
                type="date"
                value={form.scheduledOpenDate}
                onChange={(e) => set("scheduledOpenDate", e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full glass glass-border rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus-ring transition-colors"
              />
            </motion.div>
          )}

          {error && (
            <motion.p
              className="text-[var(--status-error)] text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Footer */}
        <motion.div
          className={`px-6 py-4 border-t border-[var(--glass-border)] flex items-center justify-between ${
            focusMode
              ? "opacity-0 hover:opacity-100 transition-opacity duration-300"
              : ""
          }`}
        >
          <p className="text-xs text-[var(--text-tertiary)] font-light">
            {form.content.length}/10,000 · Draft autosaved
          </p>
          <motion.button
            type="submit"
            disabled={loading || !form.content.trim()}
            className="btn-primary btn-base disabled"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
          >
            {loading ? "Saving..." : "Save entry"}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
