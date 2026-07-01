import { useEffect, useState } from "react";
import { getPreferences, updatePreferences } from "./notificationService.js";

const SETTINGS = [
  { key: "messageNotifications",  label: "Messages",  emoji: "💬" },
  { key: "callNotifications",     label: "Calls",     emoji: "📞" },
  { key: "memoryNotifications",   label: "Memories",  emoji: "📸" },
  { key: "activityNotifications", label: "Activities",emoji: "🎬" },
  { key: "plannerNotifications",  label: "Planner",   emoji: "📅" },
  { key: "presenceNotifications", label: "Presence",  emoji: "🟢" },
];

export default function NotificationSettings({ onClose }) {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPreferences().then(setPrefs).catch(() => {});
  }, []);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try { await updatePreferences({ [key]: updated[key] }); }
    finally { setSaving(false); }
  };

  const toggleQuiet = async () => {
    const updated = { ...prefs, quietHoursEnabled: !prefs.quietHoursEnabled };
    setPrefs(updated);
    await updatePreferences({ quietHoursEnabled: updated.quietHoursEnabled });
  };

  if (!prefs) return (
    <div className="flex justify-center py-8">
      <div className="w-5 h-5 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-white">Notification Settings</p>
        {onClose && <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>}
      </div>

      {/* mute all */}
      <div className="flex items-center justify-between bg-[var(--glass-bg)] rounded-xl px-4 py-3">
        <div>
          <p className="text-sm text-white">Mute all</p>
          <p className="text-xs text-[var(--text-tertiary)]">Only critical alerts pass through</p>
        </div>
        <Toggle value={prefs.muteAll} onChange={() => toggle("muteAll")} />
      </div>

      {/* per-type */}
      <div className="bg-[var(--glass-bg)] rounded-xl overflow-hidden divide-y divide-gray-800">
        {SETTINGS.map(({ key, label, emoji }) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span>{emoji}</span>
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            </div>
            <Toggle value={prefs[key]} onChange={() => toggle(key)} disabled={prefs.muteAll} />
          </div>
        ))}
      </div>

      {/* quiet hours */}
      <div className="bg-[var(--glass-bg)] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Quiet hours</p>
            <p className="text-xs text-[var(--text-tertiary)]">Suppress non-critical notifications</p>
          </div>
          <Toggle value={prefs.quietHoursEnabled} onChange={toggleQuiet} />
        </div>
        {prefs.quietHoursEnabled && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-[var(--text-disabled)] mb-1">From</p>
              <input type="time" value={prefs.quietStart}
                onChange={(e) => { setPrefs((p) => ({ ...p, quietStart: e.target.value })); updatePreferences({ quietStart: e.target.value }); }}
                className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--text-disabled)] mb-1">To</p>
              <input type="time" value={prefs.quietEnd}
                onChange={(e) => { setPrefs((p) => ({ ...p, quietEnd: e.target.value })); updatePreferences({ quietEnd: e.target.value }); }}
                className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
            </div>
          </div>
        )}
      </div>

      {saving && <p className="text-xs text-[var(--text-disabled)] text-center">Saving...</p>}
    </div>
  );
}

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={!disabled ? onChange : undefined}
      className={`w-10 h-5 rounded-full transition-colors relative ${
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
      } ${value ? "gradient-mixed" : "bg-[var(--glass-bg-strong)]"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}
