import { Router } from "express";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import Activity from "./activity.model.js";
import Relationship from "../relationship/relationship.model.js";

const router = Router();
router.use(authMiddleware);


// get active activity for relationship
router.get("/active/:relationshipId", async (req, res) => {
  try {
    const rel = await verifyRelationshipMember(req.params.relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const act = await Activity.findOne({
      relationshipId: req.params.relationshipId,
      status: { $in: ["created", "active", "paused"] },
    }).sort({ createdAt: -1 });

    res.json({ activity: act || null });
  } catch { res.status(500).json({ error: true, message: "Failed" }); }
});

// activity history
router.get("/history/:relationshipId", async (req, res) => {
  try {
    const rel = await verifyRelationshipMember(req.params.relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const activities = await Activity.find({
      relationshipId: req.params.relationshipId,
      status: "ended",
    }).sort({ createdAt: -1 }).limit(20);

    res.json({ activities });
  } catch { res.status(500).json({ error: true, message: "Failed" }); }
});

export default router;
