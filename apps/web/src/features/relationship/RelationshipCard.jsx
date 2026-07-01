import PartnerAvatar from "../../components/PartnerAvatar.jsx";
import RelationshipBadge from "../../components/RelationshipBadge.jsx";

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function RelationshipCard({ relationship, isActive, onSelect, onPin, onMute }) {
  const { partner, nickname, relationshipType, unreadCount, pinned, mutedNotifications, updatedAt } = relationship;
  const displayName = nickname || partner?.displayName || "Unknown";

  return (
    <div
      onClick={() => onSelect(relationship)}
      className={`group flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
        isActive ? "bg-indigo-900/20 border-l-2 border-[var(--accent-dream-soft)]" : "hover:bg-[var(--bg-secondary)]/60"
      }`}
    >
      <div className="relative flex-shrink-0">
        <PartnerAvatar displayName={partner?.displayName} avatarUrl={partner?.avatarUrl} size="sm" />
        {pinned && <span className="absolute -top-1 -right-1 text-xs">📌</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-[var(--text-primary)]"}`}>
            {displayName}
          </p>
          {mutedNotifications && <span className="text-xs text-[var(--text-disabled)]">🔇</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <RelationshipBadge type={relationshipType} />
          <span className="text-xs text-[var(--text-disabled)]">{timeAgo(updatedAt)}</span>
        </div>
      </div>

      {unreadCount > 0 && (
        <span className="flex-shrink-0 min-w-[20px] h-5 bg-[var(--accent-dream)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onPin?.(relationship.id)} title={pinned ? "Unpin" : "Pin"}
          className="w-7 h-7 flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--text-secondary)] text-xs rounded-lg hover:bg-[var(--glass-bg-strong)] transition-colors">
          📌
        </button>
        <button onClick={() => onMute?.(relationship.id, !mutedNotifications)}
          title={mutedNotifications ? "Unmute" : "Mute"}
          className="w-7 h-7 flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--text-secondary)] text-xs rounded-lg hover:bg-[var(--glass-bg-strong)] transition-colors">
          {mutedNotifications ? "🔔" : "🔇"}
        </button>
      </div>
    </div>
  );
}
