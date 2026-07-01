import { Router } from "express";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import GameSession from "./game.model.js";
import Relationship from "../relationship/relationship.model.js";
import { getDailyQuestion } from "./game.logic.js";

const router = Router();
router.use(authMiddleware);


router.get("/history/:relationshipId", async (req, res) => {
  try {
    const rel = await verifyRelationshipMember(req.params.relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });
    const sessions = await GameSession.find({
      relationshipId: req.params.relationshipId,
      status: "completed",
    }).sort({ createdAt: -1 }).limit(20);
    res.json({ sessions });
  } catch { res.status(500).json({ error: true, message: "Failed" }); }
});

router.get("/daily-question", (_req, res) => {
  res.json({ question: getDailyQuestion() });
});

router.get("/active/:relationshipId", async (req, res) => {
  try {
    const rel = await verifyRelationshipMember(req.params.relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });
    const session = await GameSession.findOne({
      relationshipId: req.params.relationshipId,
      status: { $in: ["waiting","active"] },
    }).sort({ createdAt: -1 });
    res.json({ session: session || null });
  } catch { res.status(500).json({ error: true, message: "Failed" }); }
});

export default router;
