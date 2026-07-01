const GAMES = [
  { type: "tic_tac_toe",           emoji: "🎮", label: "Tic Tac Toe",       desc: "Classic 3×3 grid" },
  { type: "truth_or_dare",         emoji: "🎲", label: "Truth or Dare",      desc: "Reveal secrets" },
  { type: "this_or_that",          emoji: "🤔", label: "This or That",       desc: "Pick your preference" },
  { type: "compatibility_quiz",    emoji: "💑", label: "Compatibility Quiz", desc: "How well matched?" },
  { type: "daily_question_game",   emoji: "💬", label: "Daily Question",     desc: "Today's question" },
  { type: "emoji_story_game",      emoji: "😊", label: "Emoji Story",        desc: "Build a story together" },
  { type: "draw_and_guess",        emoji: "🎨", label: "Draw & Guess",       desc: "Draw, partner guesses" },
  { type: "future_prediction_game",emoji: "🔮", label: "Future Predictions", desc: "Dream together" },
  { type: "custom_prompt_game",    emoji: "✨", label: "Custom Game",        desc: "Your own prompt" },
];

export default function GamesHub({ onStart }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-[var(--glass-border)]">
        <h2 className="text-base font-semibold text-white">Play Together</h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Choose a game to start</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.type}
            onClick={() => onStart(g.type)}
            className="flex flex-col items-center gap-2 p-4 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] hover:border-[var(--accent-dream-soft)] hover:bg-indigo-900/20 transition-all text-center"
          >
            <span className="text-3xl">{g.emoji}</span>
            <p className="text-xs font-medium text-[var(--text-primary)]">{g.label}</p>
            <p className="text-[10px] text-[var(--text-disabled)]">{g.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
