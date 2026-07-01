import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { sendGift, listGifts, openGift, reactToGift, convertGiftToMemory } from "./gift.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/",                          sendGift);
router.get("/",                           listGifts);
router.post("/:giftId/open",              openGift);
router.post("/:giftId/react",             reactToGift);
router.post("/:giftId/convert-to-memory", convertGiftToMemory);

export default router;
