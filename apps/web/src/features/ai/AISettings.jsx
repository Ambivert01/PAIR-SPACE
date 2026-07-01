import { useState } from "react";

const FEATURES = [
  { key: "insights",       label: "Relationship insights",      emoji: "✨", desc: "Pattern analysis and suggestions" },
  { key: "emotionTags",    label: "Emotion detection",          emoji: "😊", desc: "Detect mood from messages" },
  { key: "suggestions",    label: "Conversation suggestions",   emoji: "💬", desc: "Icebreakers and starters" },
  { key: "memoryAI",       label: "Memory auto-tagging",        emoji: "📸", desc: "Suggest emotion tags for memories" },
  { key: "stressDetection",label: "Stress detection",           emoji: "💙", desc: "Detect when partner may be stressed" },
];

export default function AISettings({ settings, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider px-1">AI Features</p>
      <div className="bg-[var(--glass-bg)] rounded-2xl overflow-hidden divide-y divide-gray-800">
        {FEATURES.map(({ key, label, emoji, desc }) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span>{emoji}</span>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                <p className="text-xs text-[var(--text-disabled)]">{desc}</p>
              </div>
            </div>
            <button
              onClick={() => onChange(key, !settings[key])}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings[key] ? "gradient-mixed" : "bg-[var(--glass-bg-strong)]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings[key] ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-700 px-1">
        All AI runs locally. No data leaves your private space.
      </p>
    </div>
  );
}
