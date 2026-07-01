import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  getInsights, dismissInsight, markInsightRead,
  analyzeText, getConversationSuggestions, triggerWeeklySummary,
} from "./ai.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/insights",              getInsights);
router.patch("/insights/:id/dismiss",markInsightRead);
router.delete("/insights/:id",       dismissInsight);
router.post("/analyze-text",         analyzeText);
router.get("/suggestions",           getConversationSuggestions);
router.post("/weekly-summary",       triggerWeeklySummary);

export default router;
