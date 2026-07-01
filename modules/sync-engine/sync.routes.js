import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { processBatch } from "./sync.controller.js";

const router = Router();
router.use(authMiddleware);
router.post("/batch", processBatch);

export default router;
