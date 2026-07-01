import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLatestInsights, triggerCalculation } from "./insightsService.js";
import InsightHighlightCard from "./InsightHighlightCard.jsx";
import InsightGraph from "./InsightGraph.jsx";

const HIGHLIGHT_TYPES = ["communication_frequency","shared_time_estimation","positivity_trend"];

export default function InsightsDashboard({ relationshipId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalc] = useState(false);

  const load = () => {
    if (!relationshipId) return;
    setLoading(true);
    getLatestInsights(relationshipId).then(({ insights: ins }) => setInsights(ins)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [relationshipId]);

  const handleCalculate = async () => {
    setCalc(true);
    try { await triggerCalculation(relationshipId); load(); }
    catch { /* silent */ }
    finally { setCalc(false); }
  };

  const get = (type) => insights.find(i => i.insightType === type);
  const commInsight = get("communication_frequency");
  const dailyBuckets = commInsight?.metadata?.dailyBuckets || [];

  if (loading) return (
    <div className="flex justify-center py-12">
      <motion.div className="w-7 h-7 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    </div>
  );

  if (!insights.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      <motion.span className="text-6xl" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>📊</motion.span>
      <div>
        <p className="text-[var(--text-primary)] font-semibold">No insights yet</p>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Keep chatting and we'll analyze your patterns</p>
      </div>
      <motion.button onClick={handleCalculate} disabled={calculating}
        className="btn-primary btn-base disabled:opacity-50"
        whileHover={{ scale: calculating ? 1 : 1.04 }} whileTap={{ scale: calculating ? 1 : 0.96 }}>
        {calculating ? (
          <span className="flex items-center gap-2">
            <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white inline-block rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            Calculating...
          </span>
        ) : "Generate insights"}
      </motion.button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <motion.button onClick={handleCalculate} disabled={calculating}
          className="text-xs text-[var(--accent-dream-soft)] hover:text-white transition-colors disabled:opacity-50 glass px-3 py-1.5 rounded-lg font-medium"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          {calculating ? "Calculating..." : "↻ Refresh"}
        </motion.button>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Highlights</p>
        {HIGHLIGHT_TYPES.map(type => { const ins = get(type); return ins ? <InsightHighlightCard key={type} insight={ins} /> : null; })}
      </div>

      {dailyBuckets.length > 0 && (
        <motion.div className="card-glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Daily Messages</p>
          <InsightGraph data={dailyBuckets} label="Daily Messages" color="#a855f7" />
        </motion.div>
      )}

      {insights.filter(i => !HIGHLIGHT_TYPES.includes(i.insightType)).length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">All Insights</p>
          {insights.filter(i => !HIGHLIGHT_TYPES.includes(i.insightType)).map(ins => <InsightHighlightCard key={ins._id} insight={ins} />)}
        </div>
      )}
    </div>
  );
}
