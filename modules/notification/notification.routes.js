import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  listNotifications, markRead, markAllRead, clearRead,
  getPreferences, updatePreferences,
} from "./notification.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/",                  listNotifications);
router.patch("/:id/read",        markRead);
router.post("/read-all",         markAllRead);
router.delete("/clear-read",     clearRead);
router.get("/preferences",       getPreferences);
router.patch("/preferences",     updatePreferences);

export default router;
