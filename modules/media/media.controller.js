import fs from "fs/promises";
import Relationship from "../relationship/relationship.model.js";
import Media from "./media.model.js";
import { detectType, contextFolder, SIZE_LIMITS } from "./media.multer.js";
import { processImage, processVideo, processAudio, processFile } from "./media.processor.js";

export const uploadMedia = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: true, message: "No file provided" });

  const { relationshipId, context = "chat" } = req.body;
  const userId = req.user.userId;

  try {
    // validate relationship membership if provided
    if (relationshipId) {
      const rel = await Relationship.findById(relationshipId);
      if (!rel) { await cleanup(file.path); return res.status(404).json({ error: true, message: "Relationship not found" }); }
      const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
      if (!isMember) { await cleanup(file.path); return res.status(403).json({ error: true, message: "Access denied" }); }
    }

    const type = detectType(file.mimetype);
    if (!type) { await cleanup(file.path); return res.status(422).json({ error: true, message: "Unsupported file type" }); }

    // per-type size check
    const limitMB = SIZE_LIMITS[type];
    if (file.size > limitMB * 1024 * 1024) {
      await cleanup(file.path);
      return res.status(413).json({ error: true, message: `${type} files must be under ${limitMB}MB` });
    }

    const folder = contextFolder(context);
    const fileName = file.filename;

    // process
    let processed;
    if (type === "image")      processed = await processImage(file.path, folder, fileName);
    else if (type === "video") processed = await processVideo(file.path, folder, fileName);
    else if (type === "audio") processed = await processAudio(file.path, folder, fileName);
    else                       processed = await processFile(file.path, folder, fileName);

    const media = await Media.create({
      uploaderId:     userId,
      relationshipId: relationshipId || null,
      context,
      type,
      fileName,
      originalName: file.originalname,
      mimeType:     file.mimetype,
      size:         processed.size,
      url:          processed.url,
      thumbnailUrl: processed.thumbnailUrl || "",
      duration:     processed.duration    || 0,
      width:        processed.width       || 0,
      height:       processed.height      || 0,
    });

    res.status(201).json({
      mediaId:      media._id,
      url:          media.url,
      thumbnailUrl: media.thumbnailUrl,
      mimeType:     media.mimeType,
      type:         media.type,
      size:         media.size,
      duration:     media.duration,
      width:        media.width,
      height:       media.height,
    });
  } catch (err) {
    await cleanup(file?.path);
    res.status(500).json({ error: true, message: "Upload failed" });
  }
};

export const getMediaMeta = async (req, res) => {
  try {
    const media = await Media.findById(req.params.mediaId);
    if (!media || media.deleted) return res.status(404).json({ error: true, message: "Not found" });

    // only uploader or relationship member can access
    const userId = req.user.userId;
    if (media.uploaderId.toString() !== userId) {
      if (media.relationshipId) {
        const rel = await Relationship.findById(media.relationshipId);
        const isMember = rel && (rel.user1Id.toString() === userId || rel.user2Id.toString() === userId);
        if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
      } else {
        return res.status(403).json({ error: true, message: "Access denied" });
      }
    }

    res.json(media);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch media" });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.mediaId);
    if (!media) return res.status(404).json({ error: true, message: "Not found" });
    if (media.uploaderId.toString() !== req.user.userId)
      return res.status(403).json({ error: true, message: "Access denied" });

    media.deleted = true;
    await media.save();
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: true, message: "Delete failed" });
  }
};

const cleanup = async (filePath) => {
  if (filePath) await fs.unlink(filePath).catch(() => {});
};
