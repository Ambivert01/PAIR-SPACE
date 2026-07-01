import ToggleSwitch from "./ToggleSwitch.jsx";

const AI_ITEMS = [
  { key: "enableSuggestions",          label: "Conversation suggestions",   desc: "Get icebreakers and starters" },
  { key: "enableEmotionDetection",     label: "Emotion detection",          desc: "Detect tone while typing" },
  { key: "enableConversationInsights", label: "Relationship insights",      desc: "Pattern analysis and tips" },
  { key: "enableStressDetection",      label: "Stress detection",           desc: "Detect when partner may be stressed" },
  { key: "enableMemoryAI",             label: "Memory auto-tagging",        desc: "AI suggests emotion tags" },
];

export default function AIControls({ ai, onUpdate }) {
  return (
    <div className="divide-y divide-gray-800">
      {AI_ITEMS.map(({ key, label, desc }) => (
        <ToggleSwitch key={key}
          value={ai?.[key] ?? true}
          onChange={(v) => onUpdate(key, v)}
          label={label} description={desc} />
      ))}
      <div className="py-3">
        <p className="text-xs text-gray-700">All AI runs locally. No data leaves your private space.</p>
      </div>
    </div>
  );
}
