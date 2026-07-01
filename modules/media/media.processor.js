import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { UPLOADS_ROOT } from "./media.multer.js";

// ── Image processing ───────────────────────────────────────────────────────
export const processImage = async (tempPath, folder, fileName) => {
  const destDir  = path.join(UPLOADS_ROOT, folder);
  const thumbDir = path.join(UPLOADS_ROOT, folder);
  const baseName = path.parse(fileName).name;
  const destFile  = path.join(destDir,  fileName);
  const thumbFile = path.join(thumbDir, `thumb_${baseName}.webp`);

  await fs.mkdir(destDir, { recursive: true });

  // optimized full image
  const meta = await sharp(tempPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toFile(destFile);

  // thumbnail
  await sharp(tempPath)
    .resize({ width: 300 })
    .webp({ quality: 70 })
    .toFile(thumbFile);

  await fs.unlink(tempPath).catch(() => {});

  return {
    url:          `/uploads/${folder}/${fileName}`,
    thumbnailUrl: `/uploads/${folder}/thumb_${baseName}.webp`,
    width:  meta.width,
    height: meta.height,
    size:   meta.size,
  };
};

// ── Video processing ───────────────────────────────────────────────────────
export const processVideo = async (tempPath, folder, fileName) => {
  const destDir = path.join(UPLOADS_ROOT, folder);
  await fs.mkdir(destDir, { recursive: true });

  const destFile = path.join(destDir, fileName);
  await fs.rename(tempPath, destFile);

  const stat = await fs.stat(destFile);
  let thumbnailUrl = "";

  // try ffmpeg thumbnail — graceful skip if not installed
  try {
    const { default: ffmpeg } = await import("fluent-ffmpeg");
    const baseName = path.parse(fileName).name;
    const thumbFile = path.join(destDir, `thumb_${baseName}.jpg`);

    await new Promise((resolve, reject) => {
      ffmpeg(destFile)
        .screenshots({ timestamps: ["3"], filename: `thumb_${baseName}.jpg`, folder: destDir, size: "320x?" })
        .on("end", resolve)
        .on("error", reject);
    });

    thumbnailUrl = `/uploads/${folder}/thumb_${baseName}.jpg`;
  } catch {
    // ffmpeg not available — no thumbnail
  }

  return {
    url: `/uploads/${folder}/${fileName}`,
    thumbnailUrl,
    size: stat.size,
  };
};

// ── Audio processing ───────────────────────────────────────────────────────
export const processAudio = async (tempPath, folder, fileName) => {
  const destDir = path.join(UPLOADS_ROOT, folder);
  await fs.mkdir(destDir, { recursive: true });

  const destFile = path.join(destDir, fileName);
  await fs.rename(tempPath, destFile);

  const stat = await fs.stat(destFile);

  // try to extract duration via ffmpeg
  let duration = 0;
  try {
    const { default: ffmpeg } = await import("fluent-ffmpeg");
    duration = await new Promise((resolve) => {
      ffmpeg.ffprobe(destFile, (_err, meta) => {
        resolve(meta?.format?.duration || 0);
      });
    });
  } catch { /* ffmpeg not available */ }

  return {
    url: `/uploads/${folder}/${fileName}`,
    thumbnailUrl: "",
    size: stat.size,
    duration: Math.round(duration),
  };
};

// ── Generic file ───────────────────────────────────────────────────────────
export const processFile = async (tempPath, folder, fileName) => {
  const destDir = path.join(UPLOADS_ROOT, folder);
  await fs.mkdir(destDir, { recursive: true });

  const destFile = path.join(destDir, fileName);
  await fs.rename(tempPath, destFile);

  const stat = await fs.stat(destFile);
  return { url: `/uploads/${folder}/${fileName}`, thumbnailUrl: "", size: stat.size };
};
