import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { upload } from "./media.multer.js";
import { uploadMedia, getMediaMeta, deleteMedia } from "./media.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/upload", upload.single("file"), uploadMedia);
router.get("/:mediaId",    getMediaMeta);
router.delete("/:mediaId", deleteMedia);

export default router;
