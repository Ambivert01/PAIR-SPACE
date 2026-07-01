import { MEDIA_BASE } from "@shared/constants/urls.js";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
  messages:   { emoji: "💬", label: "Message"  },
  memories:   { emoji: "📸", label: "Memory"   },
  plans:      { emoji: "📅", label: "Plan"     },
  activities: { emoji: "🎬", label: "Activity" },
  files:      { emoji: "📎", label: "File"     },
  games:      { emoji: "🎮", label: "Game"     },
};

const GAME_LABELS = {
  tic_tac_toe: "Tic Tac Toe", truth_or_dare: "Truth or Dare",
  this_or_that: "This or That", compatibility_quiz: "Compatibility Quiz",
  daily_question_game: "Daily Question", emoji_story_game: "Emoji Story",
  draw_and_guess: "Draw & Guess", future_prediction_game: "Future Predictions",
};

// Highlight matched text inline
function Highlight({ text = "", query = "" }) {
  if (!query || !text) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span>
      {parts.map((p, i) =>
        new RegExp(`^${escaped}$`, "i").test(p)
          ? <mark key={i} className="bg-[var(--accent-dream)]/30 text-indigo-200 rounded px-0.5">{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

export default function SearchResultItem({ item, type, query, onMemoryOpen }) {
  const navigate = useNavigate();
  const { emoji } = TYPE_META[type] || { emoji: "🔍" };

  const getTitle = () => {
    switch (type) {
      case "messages":   return item.content?.slice(0, 80) || "Message";
      case "memories":   return item.title || item.description?.slice(0, 60) || "Memory";
      case "plans":      return item.title || "Plan";
      case "activities": return item.metadata?.title || item.activityType?.replace(/_/g, " ") || "Activity";
      case "files":      return item.originalName || item.fileName || "File";
      case "games":      return GAME_LABELS[item.gameType] || item.gameType || "Game";
      default:           return "Result";
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case "memories":   return item.emotionTag ? `${item.emotionTag} · ${item.type?.replace(/_/g, " ")}` : item.type;
      case "plans":      return `${item.type?.replace(/_/g, " ")} · ${item.status}`;
      case "files":      return item.mimeType || item.type;
      case "games":      return item.status === "completed" ? "Completed" : item.status;
      default:           return null;
    }
  };

  const getDate = () => {
    const d = item.createdAt || item.memoryDate || item.dueDate;
    return d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
  };

  const handleClick = () => {
    switch (type) {
      case "messages":   navigate("/chat"); break;
      case "memories":   onMemoryOpen?.(item); break;
      case "plans":      navigate("/planner"); break;
      case "activities": navigate("/activities"); break;
      case "files":      window.open(`${MEDIA_BASE}${item.url}`, "_blank"); break;
      case "games":      navigate("/games"); break;
    }
  };

  return (
    <button onClick={handleClick}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--glass-bg-strong)]/60 transition-colors text-left">
      <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          <Highlight text={getTitle()} query={query} />
        </p>
        {getSubtitle() && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{getSubtitle()}</p>}
      </div>
      {getDate() && <span className="text-xs text-gray-700 flex-shrink-0">{getDate()}</span>}
    </button>
  );
}
