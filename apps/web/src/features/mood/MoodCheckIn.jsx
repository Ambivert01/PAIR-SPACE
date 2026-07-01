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
  const [myMood, setMyMood] = useState(null);
  const [partnerMood, setPartnerMood] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!relationshipId) return;
    api.get(`/api/mood/today/${relationshipId}`)
      .then(({ data }) => { setMyMood(data.myMood); setPartnerMood(data.partnerMood); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [relationshipId]);

  const handleSelect = async (emoji) => {
    setSaving(true);
    try {
      const { data } = await api.post("/api/mood/checkin", { relationshipId, emoji, note: note.trim() });
      setMyMood(data.mood);
      setShowPicker(false);
      setNote("");
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  if (loading) return <div className="skeleton h-20 rounded-2xl" />;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--glass-border)] ${className}`}
      style={{ background: "linear-gradient(135deg, rgba(255,93,126,0.08) 0%, rgba(168,85,247,0.08) 100%)" }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-love)]/40 to-transparent" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,193,99,0.2)" }}>
              <span className="text-sm">🌤️</span>
            </div>
            <span className="text-sm font-semibold text-white">Daily Mood</span>
          </div>
          {!myMood && (
            <motion.button onClick={() => setShowPicker(v => !v)}
              className="text-xs font-medium text-[var(--accent-dream-soft)] hover:text-white transition-colors glass px-3 py-1.5 rounded-lg"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              Check in
            </motion.button>
          )}
        </div>

        {/* Mood display */}
        <div className="flex items-center justify-around">
          <MoodSlot label="You" mood={myMood} onEdit={() => setShowPicker(true)} />
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1 h-1 rounded-full bg-[var(--glass-border-strong)]"
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
              ))}
            </div>
          </div>
          <MoodSlot label="Partner" mood={partnerMood} waiting={!partnerMood} />
        </div>

        {/* Picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-4 mt-4 border-t border-[var(--glass-border)]">
                <p className="text-xs text-[var(--text-tertiary)] mb-3 font-medium">How are you feeling?</p>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {MOODS.map(({ emoji, label }) => (
                    <motion.button key={emoji} onClick={() => handleSelect(emoji)} disabled={saving}
                      className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }} title={label}>
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-[9px] text-[var(--text-disabled)]">{label}</span>
                    </motion.button>
                  ))}
                </div>
                <input value={note} onChange={e => setNote(e.target.value.slice(0, 120))}
                  placeholder="Add a note... (optional)" className="input-field text-xs py-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MoodSlot({ label, mood, waiting = false, onEdit }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {mood ? (
        <motion.button onClick={onEdit} className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          whileHover={onEdit ? { scale: 1.12 } : {}} title={onEdit ? "Change mood" : undefined}
          animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          {mood.emoji}
        </motion.button>
      ) : (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {waiting ? (
            <motion.span className="text-lg text-[var(--text-disabled)]"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>?</motion.span>
          ) : (
            <span className="text-lg text-[var(--text-disabled)]">–</span>
          )}
        </div>
      )}
      <p className="text-[10px] text-[var(--text-tertiary)] font-medium">
        {mood?.note ? mood.note.slice(0, 16) + (mood.note.length > 16 ? "…" : "") : label}
      </p>
    </div>
  );
}
