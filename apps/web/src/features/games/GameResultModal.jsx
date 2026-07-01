export default function GameResultModal({ session, currentUserId, partnerName, onRestart, onEnd }) {
  const result = session?.result;
  if (!result) return null;

  const isWinner = result.winner === currentUserId;
  const isDraw   = result.draw;
  const score    = result.score;

  let emoji = "🎉", title = "Game Over!", subtitle = "";

  if (score !== undefined) {
    emoji = score >= 80 ? "💑" : score >= 60 ? "💕" : "🤝";
    title = `${score}% Compatible!`;
    subtitle = score >= 80 ? "You two are made for each other!" : score >= 60 ? "Great match!" : "Opposites attract!";
  } else if (isDraw) {
    emoji = "🤝"; title = "It's a Draw!"; subtitle = "You're perfectly matched!";
  } else if (result.winner) {
    emoji = isWinner ? "🏆" : "💙";
    title = isWinner ? "You Won!" : `${partnerName} Won!`;
    subtitle = isWinner ? "Well played! 🎉" : "Better luck next time!";
  } else if (result.answers) {
    emoji = "💬"; title = "Answers revealed!"; subtitle = "See what you both said.";
  } else if (result.story) {
    emoji = "📖"; title = "Story complete!"; subtitle = `${result.story.length} emojis long!`;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-3xl p-8 w-72 text-center space-y-5 shadow-2xl">
        <div className="text-5xl">{emoji}</div>
        <div>
          <p className="text-white font-semibold text-xl">{title}</p>
          {subtitle && <p className="text-[var(--text-secondary)] text-sm mt-1">{subtitle}</p>}
        </div>

        {/* show answers if applicable */}
        {result.answers && Object.keys(result.answers).length > 0 && (
          <div className="bg-[var(--glass-bg-strong)] rounded-xl p-3 text-left space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(result.answers).map(([uid, ans]) => (
              <p key={uid} className="text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)]">{uid === currentUserId ? "You" : partnerName}:</span> {typeof ans === "string" ? ans : JSON.stringify(ans)}
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onEnd}     className="flex-1 bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-colors">Done</button>
          <button onClick={onRestart} className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl py-2.5 text-sm font-medium transition-colors">Play again</button>
        </div>
      </div>
    </div>
  );
}
