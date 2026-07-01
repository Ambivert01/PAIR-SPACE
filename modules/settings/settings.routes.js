import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  getUserSettings, updateUserSettings,
  getRelationshipSettings, updateRelationshipSettings,
} from "./settings.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/user",          getUserSettings);
router.patch("/user",        updateUserSettings);
router.get("/relationship",  getRelationshipSettings);
router.patch("/relationship", updateRelationshipSettings);

export default router;
