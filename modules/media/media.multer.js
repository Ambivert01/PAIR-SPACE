import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.join(__dirname, "../../services/api/uploads");

const ALLOWED_MIME = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"],
  file:  ["application/pdf", "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain", "application/zip"],
};

// MB → bytes
const SIZE_LIMITS = { image: 10, video: 100, audio: 20, file: 50 };

export const detectType = (mime) => {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME)) {
    if (mimes.includes(mime)) return type;
  }
  return null;
};

export const contextFolder = (context) => {
  const map = { chat: "chat", memory: "memory", profile: "profile", voice: "audio", video: "video" };
  return map[context] || "chat";
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, path.join(UPLOADS_ROOT, "temp")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}_${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const type = detectType(file.mimetype);
  if (!type) return cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB hard cap — per-type checked in controller
});

export { UPLOADS_ROOT, SIZE_LIMITS, ALLOWED_MIME };
