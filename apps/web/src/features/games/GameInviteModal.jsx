const GAME_META = {
  tic_tac_toe:           { emoji: "🎮", label: "Tic Tac Toe" },
  truth_or_dare:         { emoji: "🎲", label: "Truth or Dare" },
  this_or_that:          { emoji: "🤔", label: "This or That" },
  quiz_about_partner:    { emoji: "💕", label: "Partner Quiz" },
  emoji_story_game:      { emoji: "😊", label: "Emoji Story" },
  draw_and_guess:        { emoji: "🎨", label: "Draw & Guess" },
  daily_question_game:   { emoji: "💬", label: "Daily Question" },
  compatibility_quiz:    { emoji: "💑", label: "Compatibility Quiz" },
  future_prediction_game:{ emoji: "🔮", label: "Future Predictions" },
  custom_prompt_game:    { emoji: "✨", label: "Custom Game" },
};

export default function GameInviteModal({ invite, partnerName, onJoin, onDecline }) {
  const { emoji, label } = GAME_META[invite.gameType] || { emoji: "🎮", label: invite.label };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-3xl p-8 w-72 text-center space-y-5 shadow-2xl">
        <div className="text-5xl">{emoji}</div>
        <div>
          <p className="text-white font-semibold text-lg">{label}</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{partnerName} wants to play!</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onDecline} className="flex-1 bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-colors">Decline</button>
          <button onClick={() => onJoin(invite.gameId)} className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl py-2.5 text-sm font-medium transition-colors">Play! 🎮</button>
        </div>
      </div>
    </div>
  );
}
