export default function PartnerAvatar({ displayName = "", avatarUrl = "", size = "lg" }) {
  const initials = displayName.slice(0, 2).toUpperCase();
  const dim = size === "lg" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm";

  if (avatarUrl)
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`${dim} rounded-full object-cover ring-2 ring-[var(--glass-border-strong)]`}
      />
    );

  return (
    <div
      className={`${dim} rounded-full gradient-mixed flex items-center justify-center font-semibold text-white shadow-glow-love`}
    >
      {initials}
    </div>
  );
}
