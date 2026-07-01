const BADGES = {
  couple:      { emoji: "❤️",  label: "Couple" },
  partner:     { emoji: "🤝",  label: "Partner" },
  best_friend: { emoji: "🌟",  label: "Best Friend" },
  custom:      { emoji: "💫",  label: "Custom" },
};

export default function RelationshipBadge({ type = "couple" }) {
  const { emoji, label } = BADGES[type] || BADGES.custom;
  return (
    <span className="inline-flex items-center gap-1.5 glass text-[var(--text-secondary)] text-xs px-3 py-1 rounded-full">
      {emoji} {label}
    </span>
  );
}
