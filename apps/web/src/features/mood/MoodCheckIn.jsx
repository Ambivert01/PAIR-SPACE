import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

const MOODS = [
  { emoji: "😊", label: "Good" },
  { emoji: "😄", label: "Happy" },
  { emoji: "🥰", label: "In love" },
  { emoji: "😌", label: "Calm" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "💪", label: "Strong" },
  { emoji: "🤔", label: "Thinking" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😔", label: "Down" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😰", label: "Anxious" },
];

export default function MoodCheckIn({ relationshipId, className = "" }) {
  const [myMood, setMyMood]         = useState(null);
  const [partnerMood, setPartnerMood] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [note, setNote]             = useState("");
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!relationshipId) return;
    api.get(`/api/mood/today/${relationshipId}`)
      .then(({ data }) => {
        setMyMood(data.myMood);
        setPartnerMood(data.partnerMood);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [relationshipId]);

  const handleSelect = async (emoji) => {
    setSaving(true);
    try {
      const { data } = await api.post("/api/mood/checkin", {
        relationshipId,
        emoji,
        note: note.trim(),
      });
      setMyMood(data.mood);
      setShowPicker(false);
      setNote("");
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="skeleton h-20 rounded-2xl" />;
  }

  return (
    <div className={`card-glass ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="hstack-sm">
          <span className="text-sm">🌤️</span>
          <h3 className="text-sm font-semibold">Daily Mood</h3>
        </div>
        {!myMood && (
          <motion.button
            onClick={() => setShowPicker((v) => !v)}
            className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-light)] transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Check in
          </motion.button>
        )}
      </div>

      {/* Both moods */}
      <div className="flex items-center justify-around py-2">
        <MoodSlot
          label="You"
          mood={myMood}
          onEdit={() => setShowPicker(true)}
        />
        <div className="text-[var(--text-disabled)] text-xs">·····</div>
        <MoodSlot
          label="Partner"
          mood={partnerMood}
          waiting={!partnerMood}
        />
      </div>

      {/* Mood picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[var(--glass-border)] mt-3">
              <p className="text-xs text-[var(--text-tertiary)] mb-2">How are you feeling?</p>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {MOODS.map(({ emoji, label }) => (
                  <motion.button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                    disabled={saving}
                    className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    title={label}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[9px] text-[var(--text-disabled)]">{label}</span>
                  </motion.button>
                ))}
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 120))}
                placeholder="Add a note... (optional)"
                className="input-field text-xs py-2"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MoodSlot({ label, mood, waiting = false, onEdit }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {mood ? (
        <motion.button
          onClick={onEdit}
          className="text-3xl"
          whileHover={onEdit ? { scale: 1.15 } : {}}
          title={onEdit ? "Change mood" : undefined}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {mood.emoji}
        </motion.button>
      ) : (
        <div className="w-9 h-9 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
          {waiting ? (
            <motion.span
              className="text-sm text-[var(--text-disabled)]"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              ?
            </motion.span>
          ) : (
            <span className="text-sm text-[var(--text-disabled)]">–</span>
          )}
        </div>
      )}
      <p className="text-[10px] text-[var(--text-tertiary)]">
        {mood?.note ? mood.note.slice(0, 20) + (mood.note.length > 20 ? "…" : "") : label}
      </p>
    </div>
  );
}
