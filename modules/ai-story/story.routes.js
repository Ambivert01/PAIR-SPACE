import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { listStories, getStory, generateStory, updateStory } from "./story.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/",              listStories);
router.post("/generate",     generateStory);
router.get("/:storyId",      getStory);
router.patch("/:storyId",    updateStory);

export default router;
