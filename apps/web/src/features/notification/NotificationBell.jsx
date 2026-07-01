import { useState } from "react";
import NotificationBadge from "./NotificationBadge.jsx";
import NotificationPanel from "./NotificationPanel.jsx";

export default function NotificationBell({ notifications, unreadCount, onRead, onMarkAllRead, onClearRead }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative touch-target flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        🔔
        <NotificationBadge count={unreadCount} />
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          onRead={onRead}
          onMarkAllRead={onMarkAllRead}
          onClearRead={onClearRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
