import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  createPlan, listPlans, updatePlan, deletePlan,
  completeHabit, toggleChecklistItem,
} from "./plan.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/create",                       createPlan);
router.get("/list",                          listPlans);
router.patch("/:planId",                     updatePlan);
router.delete("/:planId",                    deletePlan);
router.post("/:planId/habit-complete",       completeHabit);
router.post("/:planId/checklist-toggle",     toggleChecklistItem);

export default router;
