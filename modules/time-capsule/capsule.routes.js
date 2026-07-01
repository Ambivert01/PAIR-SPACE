import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  createCapsule, listCapsules, openCapsule, manualUnlock,
  reactToCapsule, convertToMemory, deleteCapsule,
} from "./capsule.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/",                              createCapsule);
router.get("/",                               listCapsules);
router.post("/:capsuleId/open",               openCapsule);
router.post("/:capsuleId/unlock",             manualUnlock);
router.post("/:capsuleId/react",              reactToCapsule);
router.post("/:capsuleId/convert-to-memory",  convertToMemory);
router.delete("/:capsuleId",                  deleteCapsule);

export default router;
