import PartnerAvatar from "../../components/PartnerAvatar.jsx";
import PresenceIndicator from "./PresenceIndicator.jsx";
import ActivityBadge from "./ActivityBadge.jsx";

const timeAgo = (iso) => {
  if (!iso) return null;
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function PartnerPresenceCard({ partner, presence }) {
  const status = presence?.status || "offline";
  const isOnline = status !== "offline";
  const lastActive = !isOnline ? timeAgo(presence?.lastActiveAt) : null;

  return (
    <div className="bg-[var(--glass-bg)] rounded-xl p-4 flex items-center gap-4">
      <div className="relative">
        <PartnerAvatar displayName={partner?.displayName} avatarUrl={partner?.avatarUrl} size="sm" />
        <span className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator status={status} />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{partner?.displayName}</p>
        <ActivityBadge
          status={status}
          activity={presence?.activity}
          customMessage={presence?.customMessage}
        />
        {lastActive && (
          <p className="text-xs text-gray-700 mt-0.5">last seen {lastActive}</p>
        )}
      </div>
    </div>
  );
}
