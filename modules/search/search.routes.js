import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { globalSearch } from "./search.controller.js";

const router = Router();
router.use(authMiddleware);
router.get("/global", globalSearch);

export default router;
