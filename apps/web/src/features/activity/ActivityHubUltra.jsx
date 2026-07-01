/**
 * ActivityHubUltra Component
 *
 * Premium activity selection with glass cards, staggered animations, and floating orbs
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  hoverLift,
  tapScale,
} from "../../utils/motionPresets.js";

const ACTIVITIES = [
  {
    type: "watch_together",
    emoji: "🎬",
    label: "Watch Together",
    needsUrl: true,
  },
  {
    type: "listen_together",
    emoji: "🎧",
    label: "Listen Together",
    needsUrl: true,
  },
  {
    type: "focus_session",
    emoji: "⏳",
    label: "Focus Session",
    needsUrl: false,
  },
  {
    type: "study_session",
    emoji: "📚",
    label: "Study Session",
    needsUrl: false,
  },
  { type: "game_session", emoji: "🎮", label: "Game Session", needsUrl: false },
  {
    type: "planning_session",
    emoji: "📅",
    label: "Planning Session",
    needsUrl: false,
  },
  {
    type: "reading_session",
    emoji: "📖",
    label: "Reading Session",
    needsUrl: false,
  },
  {
    type: "custom_session",
    emoji: "✨",
    label: "Custom Session",
    needsUrl: false,
  },
];

export default function ActivityHubUltra({ onStart }) {
  const [selected, setSelected] = useState(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const act = ACTIVITIES.find((a) => a.type === selected);

  const handleStart = () => {
    if (!selected) return;
    onStart(selected, {
      title: title || act?.label,
      externalUrl: url,
    });
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--glass-border)] glass-strong relative z-10">
        <h2 className="text-base font-semibold text-white">
          Do something together
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Choose an activity to share in real time
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {/* Activity grid with stagger animation */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {ACTIVITIES.map((a, idx) => (
            <motion.button
              key={a.type}
              onClick={() => setSelected(a.type)}
              className={`glass p-6 rounded-3xl shadow-soft relative overflow-hidden transition-all duration-300 ${
                selected === a.type
                  ? "border-2 border-[var(--accent-dream)] shadow-glow-dream"
                  : "border border-[var(--glass-border)]"
              }`}
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Gradient overlay for selected */}
              {selected === a.type && (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-love)]/10 to-[var(--accent-dream)]/10 pointer-events-none" />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-4xl">{a.emoji}</span>
                <span className="text-xs text-[var(--text-primary)] text-center font-medium">
                  {a.label}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* URL input for media activities */}
        {selected && act?.needsUrl && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video/audio URL (YouTube, direct link...)"
              className="w-full glass-strong rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus-ring glass-border transition-colors"
            />
          </motion.div>
        )}

        {/* Title input */}
        {selected && (
          <motion.input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Session title (optional)"
            className="w-full glass-strong rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus-ring glass-border transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}
      </div>

      {/* Start button */}
      {selected && (
        <motion.div
          className="p-4 border-t border-[var(--glass-border)] glass-strong relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={handleStart}
            className="btn-primary w-full"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(255, 77, 109, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Start {ACTIVITIES.find((a) => a.type === selected)?.label}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
