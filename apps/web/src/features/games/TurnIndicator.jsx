export default function TurnIndicator({ isMyTurn, partnerName }) {
  return (
    <div className={`text-center py-2 text-xs font-medium rounded-xl px-4 ${
      isMyTurn ? "bg-indigo-900/40 text-[var(--accent-dream-soft)]" : "bg-[var(--glass-bg-strong)] text-[var(--text-tertiary)]"
    }`}>
      {isMyTurn ? "Your turn ✨" : `${partnerName}'s turn...`}
    </div>
  );
}
