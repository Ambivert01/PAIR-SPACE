import RelationshipInsight from "./insight.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import { calculateInsights } from "./insight.calculator.js";


export const getInsights = async (req, res) => {
  const { relationshipId, period = "weekly" } = req.query;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const insights = await RelationshipInsight.find({ relationshipId, period })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ insights });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch insights" });
  }
};

export const getLatestInsights = async (req, res) => {
  const { relationshipId } = req.query;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    // get most recent insight per type
    const types = [
      "communication_frequency","conversation_balance","response_time_pattern",
      "shared_activity_frequency","memory_creation_frequency","call_frequency",
      "positivity_trend","shared_time_estimation","planner_alignment","engagement_trend",
    ];

    const latest = await Promise.all(
      types.map((t) =>
        RelationshipInsight.findOne({ relationshipId, insightType: t })
          .sort({ createdAt: -1 })
      )
    );

    res.json({ insights: latest.filter(Boolean) });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch insights" });
  }
};

export const triggerCalculation = async (req, res) => {
  const { relationshipId } = req.body;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const insights = await calculateInsights(
      relationshipId,
      rel.user1Id,
      rel.user2Id,
      "weekly"
    );
    res.json({ message: "Insights calculated", count: insights.length });
  } catch (err) {
    res.status(500).json({ error: true, message: "Calculation failed" });
  }
};
