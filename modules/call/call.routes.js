import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import Call from "./call.model.js";
import Relationship from "../relationship/relationship.model.js";

const router = Router();
router.use(authMiddleware);

router.get("/history/:relationshipId", async (req, res) => {
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(req.params.relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const ok = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!ok) return res.status(403).json({ error: true, message: "Access denied" });

    const calls = await Call.find({ relationshipId: req.params.relationshipId })
      .sort({ startedAt: -1 }).limit(20);
    res.json({ calls });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch call history" });
  }
});

export default router;
