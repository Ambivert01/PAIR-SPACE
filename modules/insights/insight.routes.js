import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { getInsights, getLatestInsights, triggerCalculation } from "./insight.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/",        getInsights);
router.get("/latest",  getLatestInsights);
router.post("/calculate", triggerCalculation);

export default router;
