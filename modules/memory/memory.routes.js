import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  createMemory, getTimeline, getMemory, editMemory, deleteMemory,
  togglePin, toggleFavorite, reactToMemory, addComment, searchMemories,
} from "./memory.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/create",                    createMemory);
router.get("/timeline",                   getTimeline);
router.get("/search",                     searchMemories);
router.get("/:memoryId",                  getMemory);
router.patch("/:memoryId",                editMemory);
router.delete("/:memoryId",               deleteMemory);
router.post("/:memoryId/pin",             togglePin);
router.post("/:memoryId/favorite",        toggleFavorite);
router.post("/:memoryId/react",           reactToMemory);
router.post("/:memoryId/comment",         addComment);

export default router;
