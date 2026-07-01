import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { inviteValidation, relationshipIdValidation } from "./relationship.validation.js";
import {
  sendInvite, acceptInvite, rejectInvite, cancelInvite,
  getMyRelationship, listMyRelationships, getRelationshipById,
  endRelationship, renameRelationship, archiveRelationship,
  pinRelationship, muteRelationship, getRelationshipStats,
} from "./relationship.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/invite",  inviteValidation,       sendInvite);
router.post("/accept",  relationshipIdValidation, acceptInvite);
router.post("/reject",  relationshipIdValidation, rejectInvite);
router.post("/cancel",  relationshipIdValidation, cancelInvite);
router.post("/end",     relationshipIdValidation, endRelationship);
router.get("/my",       getMyRelationship);
router.get("/list",     listMyRelationships);
router.get("/:relationshipId/stats", getRelationshipStats);
router.get("/:relationshipId", getRelationshipById);
router.patch("/rename", renameRelationship);
router.post("/archive", archiveRelationship);
router.post("/pin",     pinRelationship);
router.post("/mute",    muteRelationship);

export default router;
