const TYPE_ICON = {
  message_received:   "💬", message_reaction: "😊", message_reply: "↩",
  missed_call:        "📵", incoming_call:    "📞", call_reminder: "⏰",
  memory_created:     "📸", memory_reaction:  "❤️", memory_comment: "💬",
  activity_invite:    "🎬", activity_started: "▶",  activity_reminder: "⏰",
  planner_reminder:   "📅", habit_reminder:   "🔥", goal_progress: "🎯",
  anniversary_reminder:"💍", relationship_event: "✨",
  presence_update:    "🟢", system_alert:     "⚡",
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function NotificationItem({ notification, onRead }) {
  return (
    <button
      onClick={() => !notification.read && onRead(notification._id)}
      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
        !notification.read ? "bg-[var(--accent-dream)]/10" : ""
      }`}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">
        {TYPE_ICON[notification.type] || "🔔"}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.read ? "text-[var(--text-tertiary)]" : "text-white font-medium"}`}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-[var(--text-disabled)] mt-0.5 truncate">{notification.message}</p>
        )}
        <p className="text-xs text-[var(--text-disabled)] mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "var(--accent-dream-soft)" }} />
      )}
    </button>
  );
}
