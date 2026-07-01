import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { getMessages, searchMessages } from "./chat.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/messages/:relationshipId", getMessages);
router.get("/search/:relationshipId",   searchMessages);

export default router;
