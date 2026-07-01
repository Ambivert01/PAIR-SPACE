import { useEffect, useState } from "react";
import { getLatestInsights, triggerCalculation } from "./insightsService.js";
import InsightHighlightCard from "./InsightHighlightCard.jsx";
import InsightGraph from "./InsightGraph.jsx";

const HIGHLIGHT_TYPES = ["communication_frequency","shared_time_estimation","positivity_trend"];

export default function InsightsDashboard({ relationshipId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [calculating, setCalc]  = useState(false);

  const load = () => {
    if (!relationshipId) return;
    setLoading(true);
    getLatestInsights(relationshipId)
      .then(({ insights: ins }) => setInsights(ins))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [relationshipId]);

  const handleCalculate = async () => {
    setCalc(true);
    try {
      await triggerCalculation(relationshipId);
      load();
    } catch { /* silent */ }
    finally { setCalc(false); }
  };

  const get = (type) => insights.find((i) => i.insightType === type);
  const commInsight = get("communication_frequency");
  const dailyBuckets = commInsight?.metadata?.dailyBuckets || [];

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-5 h-5 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!insights.length) return (
    <div className="text-center py-8 space-y-3">
      <span className="text-4xl">📊</span>
      <p className="text-[var(--text-tertiary)] text-sm">No insights yet.</p>
      <button onClick={handleCalculate} disabled={calculating}
        className="gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors">
        {calculating ? "Calculating..." : "Generate insights"}
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* refresh button */}
      <div className="flex justify-end">
        <button onClick={handleCalculate} disabled={calculating}
          className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-soft)] transition-colors disabled:opacity-50">
          {calculating ? "Calculating..." : "↻ Refresh insights"}
        </button>
      </div>

      {/* highlights */}
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">This Week</p>
        {HIGHLIGHT_TYPES.map((type) => {
          const ins = get(type);
          return ins ? <InsightHighlightCard key={type} insight={ins} /> : null;
        })}
      </div>

      {/* daily message graph */}
      {dailyBuckets.length > 0 && (
        <div className="bg-[var(--glass-bg)] rounded-2xl p-4">
          <InsightGraph data={dailyBuckets} label="Daily Messages" color="#6366f1" />
        </div>
      )}

      {/* all other insights */}
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">All Insights</p>
        {insights
          .filter((i) => !HIGHLIGHT_TYPES.includes(i.insightType))
          .map((ins) => <InsightHighlightCard key={ins._id} insight={ins} />)
        }
      </div>
    </div>
  );
}
