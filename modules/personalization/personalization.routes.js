import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { getPersonalization, updatePersonalization, resetPersonalization } from "./personalization.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/",       getPersonalization);
router.patch("/",     updatePersonalization);
router.post("/reset", resetPersonalization);

export default router;
