import { useRelationship } from "../context/RelationshipProvider.jsx";
import InsightsDashboard from "../features/insights/InsightsDashboard.jsx";
import PageLayout, { PageSpinner } from "../components/PageLayout.jsx";

export default function InsightsPage() {
  const { rel, loading: relLoading } = useRelationship();

  return (
    <PageLayout
      title="Relationship Insights"
      subtitle="Weekly patterns & trends"
      icon="📊"
      accent="love"
      headerRight={<span className="text-xs text-[var(--text-disabled)] glass px-3 py-1.5 rounded-lg">This week</span>}
    >
      <div className="overflow-y-auto px-4 py-5">
        {!rel ? (
          <PageSpinner label="Loading insights..." />
        ) : (
          <InsightsDashboard relationshipId={rel.id} />
        )}
      </div>
    </PageLayout>
  );
}
