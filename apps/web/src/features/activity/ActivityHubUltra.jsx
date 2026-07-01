import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../utils/motionPresets.js";

const ACTIVITIES = [
  { type: "watch_together",   emoji: "🎬", label: "Watch Together",   needsUrl: true,  color: "rgba(255,93,126,0.18)",  glow: "rgba(255,93,126,0.35)" },
  { type: "listen_together",  emoji: "🎧", label: "Listen Together",  needsUrl: true,  color: "rgba(168,85,247,0.18)", glow: "rgba(168,85,247,0.35)" },
  { type: "focus_session",    emoji: "⏳", label: "Focus Session",    needsUrl: false, color: "rgba(255,193,99,0.18)",  glow: "rgba(255,193,99,0.35)" },
  { type: "study_session",    emoji: "📚", label: "Study Session",    needsUrl: false, color: "rgba(96,165,250,0.18)",  glow: "rgba(96,165,250,0.35)" },
  { type: "game_session",     emoji: "🎮", label: "Game Session",     needsUrl: false, color: "rgba(168,85,247,0.18)", glow: "rgba(168,85,247,0.35)" },
  { type: "planning_session", emoji: "📅", label: "Planning Session", needsUrl: false, color: "rgba(255,193,99,0.18)",  glow: "rgba(255,193,99,0.35)" },
  { type: "reading_session",  emoji: "📖", label: "Reading Session",  needsUrl: false, color: "rgba(52,211,153,0.15)",  glow: "rgba(52,211,153,0.35)" },
  { type: "custom_session",   emoji: "✨", label: "Custom Session",   needsUrl: false, color: "rgba(255,93,126,0.15)",  glow: "rgba(255,93,126,0.30)" },
];

export default function ActivityHubUltra({ onStart }) {
  const [selected, setSelected] = useState(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const act = ACTIVITIES.find(a => a.type === selected);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,1), transparent)", filter: "blur(70px)" }} />
      <div className="absolute bottom-24 left-0 w-56 h-56 rounded-full pointer-events-none opacity-12"
        style={{ background: "radial-gradient(circle, rgba(255,93,126,1), transparent)", filter: "blur(60px)" }} />

      {/* Header */}
      <div className="px-5 py-5 relative z-10">
        <h2 className="text-xl font-bold text-white">Do something together</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Choose an activity to share in real time</p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
        <motion.div className="grid grid-cols-2 gap-3" variants={staggerContainer} initial="initial" animate="animate">
          {ACTIVITIES.map((a) => {
            const isSelected = selected === a.type;
            return (
              <motion.button key={a.type} onClick={() => setSelected(a.type)}
                className="relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-200"
                style={{
                  background: isSelected ? a.color : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isSelected ? a.glow : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isSelected ? `0 0 24px ${a.glow}` : "none",
                }}
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}>
                {isSelected && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${a.glow}, transparent 70%)` }} />
                )}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      background: isSelected ? a.color : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isSelected ? a.glow : "rgba(255,255,255,0.1)"}`,
                    }}>
                    {a.emoji}
                  </div>
                  <span className="text-sm font-semibold text-white leading-tight">{a.label}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {selected && act?.needsUrl && (
          <motion.div className="mt-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="Paste video/audio URL (YouTube, direct link...)"
              className="input-field text-sm" />
          </motion.div>
        )}

        {selected && (
          <motion.input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Session title (optional)"
            className="input-field text-sm mt-3"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} />
        )}
      </div>

      {/* Start button */}
      {selected && (
        <motion.div className="p-4 relative z-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,10,23,0.85)", backdropFilter: "blur(20px)" }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button onClick={() => onStart(selected, { title: title || act?.label, externalUrl: url })}
            className="btn-primary w-full text-base py-3.5"
            whileHover={{ scale: 1.02, boxShadow: "0 0 32px rgba(255,93,126,0.45)" }}
            whileTap={{ scale: 0.98 }}>
            Start {act?.label}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
