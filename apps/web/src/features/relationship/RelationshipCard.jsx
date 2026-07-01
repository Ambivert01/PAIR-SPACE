import { motion } from "framer-motion";
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

export default function RelationshipCard({ relationship, isActive, onSelect, onPin, onMute, onArchive }) {
  const { partner, nickname, relationshipType, unreadCount, pinned, mutedNotifications, updatedAt, status } = relationship;
  const displayName = nickname || partner?.displayName || "Unknown";
  const isPending = status === "pending";

  return (
    <motion.div
      onClick={() => onSelect(relationship)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer mb-2"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(255,93,126,0.10))"
          : "rgba(255,255,255,0.04)",
        border: isActive
          ? "1px solid rgba(168,85,247,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isActive ? "0 0 20px rgba(168,85,247,0.15)" : "none",
      }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,93,126,0.06), rgba(168,85,247,0.06))" }} />

      {/* Left accent bar for active */}
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent-love)] to-[var(--accent-dream)]" />}

      <div className="flex items-center gap-3 px-4 py-4 relative z-10">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <PartnerAvatar displayName={partner?.displayName} avatarUrl={partner?.avatarUrl} size="sm" />
          {pinned && (
            <span className="absolute -top-1 -right-1 text-xs w-4 h-4 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,193,99,0.2)", border: "1px solid rgba(255,193,99,0.4)" }}>
              📌
            </span>
          )}
          {isPending && (
            <motion.span className="absolute -bottom-0.5 -right-0.5 text-sm"
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              💌
            </motion.span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            {mutedNotifications && <span className="text-xs text-[var(--text-disabled)]">🔇</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <RelationshipBadge type={relationshipType} />
            <span className="text-[11px] text-[var(--text-disabled)]">{timeAgo(updatedAt)}</span>
          </div>
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            className="flex-shrink-0 min-w-[22px] h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5"
            style={{ background: "linear-gradient(135deg, var(--accent-love), var(--accent-dream))" }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onPin?.(relationship.id)} title={pinned ? "Unpin" : "Pin"}
            className="w-7 h-7 flex items-center justify-center text-[var(--text-disabled)] hover:text-white text-xs rounded-lg hover:bg-white/10 transition-colors">
            📌
          </button>
          <button onClick={() => onMute?.(relationship.id, !mutedNotifications)}
            title={mutedNotifications ? "Unmute" : "Mute"}
            className="w-7 h-7 flex items-center justify-center text-[var(--text-disabled)] hover:text-white text-xs rounded-lg hover:bg-white/10 transition-colors">
            {mutedNotifications ? "🔔" : "🔇"}
          </button>
          {onArchive && (
            <button onClick={() => onArchive(relationship.id)} title="Archive"
              className="w-7 h-7 flex items-center justify-center text-[var(--text-disabled)] hover:text-white text-xs rounded-lg hover:bg-white/10 transition-colors">
              📦
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
