import ToggleSwitch from "./ToggleSwitch.jsx";

export default function NotificationControls({ notifications, onUpdate }) {
  return (
    <div className="divide-y divide-gray-800">
      <ToggleSwitch value={notifications?.enableSound ?? true}
        onChange={(v) => onUpdate("enableSound", v)}
        label="Sound alerts" description="Play sound for new notifications" />
      <ToggleSwitch value={notifications?.enableBrowserNotification ?? true}
        onChange={(v) => onUpdate("enableBrowserNotification", v)}
        label="Browser notifications" description="Show notifications when tab is in background" />
      <ToggleSwitch value={notifications?.quietHoursEnabled ?? false}
        onChange={(v) => onUpdate("quietHoursEnabled", v)}
        label="Quiet hours" description="Suppress non-critical notifications" />

      {notifications?.quietHoursEnabled && (
        <div className="py-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-[var(--text-disabled)] mb-1">From</p>
            <input type="time" value={notifications?.quietStart || "22:00"}
              onChange={(e) => onUpdate("quietStart", e.target.value)}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--text-disabled)] mb-1">To</p>
            <input type="time" value={notifications?.quietEnd || "08:00"}
              onChange={(e) => onUpdate("quietEnd", e.target.value)}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
          </div>
        </div>
      )}
    </div>
  );
}
