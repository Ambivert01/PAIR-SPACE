import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import NotificationItem from "./NotificationItem.jsx";

export default function NotificationPanel({ notifications, onRead, onMarkAllRead, onClearRead, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-2xl shadow-strong z-50 overflow-hidden"
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
        <p className="text-sm font-medium text-white">Notifications</p>
        <div className="flex gap-3">
          <button onClick={onMarkAllRead} className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-light)] transition-colors">
            Mark all read
          </button>
          <button onClick={onClearRead} className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="empty-state py-10">
            <span className="empty-state-icon">🔔</span>
            <p className="empty-state-desc">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} onRead={onRead} />
          ))
        )}
      </div>
    </motion.div>
  );
}
