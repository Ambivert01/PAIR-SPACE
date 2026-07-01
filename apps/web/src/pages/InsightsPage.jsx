import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import InsightsDashboard from "../features/insights/InsightsDashboard.jsx";

export default function InsightsPage() {
  const navigate = useNavigate();
  const { rel, loading: relLoading } = useRelationship();


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--bg-primary)] z-10">
        <button onClick={() => navigate("/relationship")} className="text-[var(--text-tertiary)] hover:text-white transition-colors">←</button>
        <h1 className="text-base font-semibold flex-1">Relationship Insights</h1>
        <span className="text-xs text-[var(--text-disabled)]">This week</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {rel ? (
          <InsightsDashboard relationshipId={rel.id} />
        ) : (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
