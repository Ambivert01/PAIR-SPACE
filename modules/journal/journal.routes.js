import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  createEntry, listEntries, getEntry, editEntry, deleteEntry,
  addResponse, reactToEntry, toggleBookmark, convertToMemory,
} from "./journal.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/",                          createEntry);
router.get("/",                           listEntries);
router.get("/:entryId",                   getEntry);
router.patch("/:entryId",                 editEntry);
router.delete("/:entryId",                deleteEntry);
router.post("/:entryId/respond",          addResponse);
router.post("/:entryId/react",            reactToEntry);
router.post("/:entryId/bookmark",         toggleBookmark);
router.post("/:entryId/convert-to-memory", convertToMemory);

export default router;
