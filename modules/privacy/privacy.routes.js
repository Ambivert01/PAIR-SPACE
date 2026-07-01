import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  setIncognito, lockMemory, unlockMemory,
  blockPartner, unblockPartner, exportData,
  getSessions, revokeSession, revokeAllSessions,
  clearChatHistory,
} from "./privacy.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/incognito",                  setIncognito);
router.post("/memories/:memoryId/lock",    lockMemory);
router.post("/memories/:memoryId/unlock",  unlockMemory);
router.post("/block",                      blockPartner);
router.post("/unblock",                    unblockPartner);
router.get("/export",                      exportData);
router.get("/sessions",                    getSessions);
router.delete("/sessions/:sessionId",      revokeSession);
router.delete("/sessions",                 revokeAllSessions);
router.post("/clear-chat",                 clearChatHistory);

export default router;
