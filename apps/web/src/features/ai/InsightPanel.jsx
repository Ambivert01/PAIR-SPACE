import { useEffect, useState } from "react";
import { getInsights, dismissInsight, getConversationSuggestions } from "./aiService.js";
import InsightCard from "./InsightCard.jsx";
import SuggestionCard from "./SuggestionCard.jsx";

export default function InsightPanel({ relationshipId }) {
  const [insights, setInsights]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!relationshipId) return;
    Promise.all([
      getInsights(relationshipId),
      getConversationSuggestions(relationshipId),
    ])
      .then(([{ insights: ins }, { suggestions: sug }]) => {
        setInsights(ins);
        setSuggestions(sug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [relationshipId]);

  const handleDismiss = async (id) => {
    await dismissInsight(id).catch(() => {});
    setInsights((prev) => prev.filter((i) => i._id !== id));
  };

  if (loading) return null;
  if (insights.length === 0 && suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* AI header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[var(--text-disabled)] uppercase tracking-wider">✨ AI Insights</p>
        <button
          onClick={() => setShowSuggestions((v) => !v)}
          className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-soft)] transition-colors"
        >
          {showSuggestions ? "Hide suggestions" : "Conversation starters"}
        </button>
      </div>

      {/* insights */}
      {insights.slice(0, 3).map((ins) => (
        <InsightCard key={ins._id} insight={ins} onDismiss={handleDismiss} />
      ))}

      {/* conversation suggestions */}
      {showSuggestions && suggestions.map((s, i) => (
        <SuggestionCard key={i} suggestion={s} />
      ))}
    </div>
  );
}
