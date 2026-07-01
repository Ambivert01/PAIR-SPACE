import { motion } from "framer-motion";

const GAMES = [
  { type: "tic_tac_toe",            emoji: "🎮", label: "Tic Tac Toe",       desc: "Classic 3×3 grid",        color: "var(--accent-dream)" },
  { type: "truth_or_dare",          emoji: "🎲", label: "Truth or Dare",      desc: "Reveal secrets",          color: "var(--accent-love)" },
  { type: "this_or_that",           emoji: "🤔", label: "This or That",       desc: "Pick your preference",    color: "var(--accent-glow)" },
  { type: "compatibility_quiz",     emoji: "💑", label: "Compatibility Quiz", desc: "How well matched?",       color: "var(--accent-love)" },
  { type: "daily_question_game",    emoji: "💬", label: "Daily Question",     desc: "Today's question",        color: "var(--accent-dream)" },
  { type: "emoji_story_game",       emoji: "😊", label: "Emoji Story",        desc: "Build a story together",  color: "var(--accent-glow)" },
  { type: "draw_and_guess",         emoji: "🎨", label: "Draw & Guess",       desc: "Draw, partner guesses",   color: "var(--accent-dream)" },
  { type: "future_prediction_game", emoji: "🔮", label: "Future Predictions", desc: "Dream together",          color: "var(--accent-love)" },
  { type: "custom_prompt_game",     emoji: "✨", label: "Custom Game",        desc: "Your own prompt",         color: "var(--accent-glow)" },
];

export default function GamesHub({ onStart }) {
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="text-center space-y-1 pb-2">
        <p className="text-[var(--text-tertiary)] text-sm">Choose a game to play together</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((g, i) => (
          <motion.button
            key={g.type}
            onClick={() => onStart(g.type)}
            className="card-glass card-interactive flex flex-col items-center gap-3 p-5 relative overflow-hidden text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${g.color}20`, border: `1px solid ${g.color}30` }}
            >
              <span className="text-2xl">{g.emoji}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{g.label}</p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{g.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
