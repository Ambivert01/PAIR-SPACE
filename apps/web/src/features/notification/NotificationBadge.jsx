export default function NotificationBadge({ count }) {
  if (!count) return null;
  return (
    <span className="badge-dot">
      {count > 99 ? "99+" : count}
    </span>
  );
}
