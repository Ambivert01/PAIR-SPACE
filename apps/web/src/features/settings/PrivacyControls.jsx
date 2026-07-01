import ToggleSwitch from "./ToggleSwitch.jsx";

const PRIVACY_ITEMS = [
  { key: "showOnlineStatus",    label: "Show online status",      desc: "Partner can see when you're online" },
  { key: "showActivityStatus",  label: "Show activity status",    desc: "Show what you're doing (studying, watching...)" },
  { key: "showTypingIndicator", label: "Show typing indicator",   desc: "Partner sees when you're typing" },
  { key: "hideLastSeen",        label: "Hide last seen",          desc: "Don't show when you were last active" },
  { key: "allowLocationSharing",label: "Allow location sharing",  desc: "Share location in memories and activities" },
  { key: "allowMemoryAutoTag",  label: "Memory auto-tagging",     desc: "AI suggests emotion tags for memories" },
];

export default function PrivacyControls({ privacy, onUpdate }) {
  return (
    <div className="divide-y divide-gray-800">
      {PRIVACY_ITEMS.map(({ key, label, desc }) => (
        <ToggleSwitch
          key={key}
          value={privacy?.[key] ?? true}
          onChange={(v) => onUpdate(key, v)}
          label={label}
          description={desc}
        />
      ))}
    </div>
  );
}
