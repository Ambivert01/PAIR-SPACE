import TicTacToe from "./TicTacToe.jsx";
import TruthOrDare from "./TruthOrDare.jsx";
import QuizGame from "./QuizGame.jsx";
import EmojiStory from "./EmojiStory.jsx";
import DrawAndGuess from "./DrawAndGuess.jsx";

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

export default function GameBoard({ session, currentUserId, partnerName, onMove }) {
  const { gameType } = session;
  const meta = GAME_META[gameType] || { emoji: "🎮", label: gameType };

  const props = { session, currentUserId, partnerName, onMove };

  const renderGame = () => {
    switch (gameType) {
      case "tic_tac_toe":           return <TicTacToe {...props} />;
      case "truth_or_dare":         return <TruthOrDare {...props} />;
      case "this_or_that":
      case "daily_question_game":
      case "future_prediction_game":
      case "compatibility_quiz":
      case "custom_prompt_game":    return <QuizGame {...props} />;
      case "emoji_story_game":      return <EmojiStory {...props} />;
      case "draw_and_guess":        return <DrawAndGuess {...props} />;
      default:                      return <p className="text-[var(--text-tertiary)] text-center text-sm">Game UI coming soon</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-center">
        <span className="text-xl">{meta.emoji}</span>
        <p className="text-sm font-medium text-[var(--text-secondary)]">{meta.label}</p>
      </div>
      {session.status === "waiting" ? (
        <p className="text-center text-yellow-500 text-sm animate-pulse">Waiting for {partnerName} to join...</p>
      ) : (
        renderGame()
      )}
    </div>
  );
}
