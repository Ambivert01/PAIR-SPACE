// ── Feature flags ──────────────────────────────────────────────────────────
// Set env var DISABLE_FEATURE_X=true to disable a feature
export const FEATURES = {
  AI_INSIGHTS:      process.env.DISABLE_AI_INSIGHTS      !== "true",
  GAMES:            process.env.DISABLE_GAMES            !== "true",
  GIFTS:            process.env.DISABLE_GIFTS            !== "true",
  TIME_CAPSULES:    process.env.DISABLE_TIME_CAPSULES    !== "true",
  JOURNAL:          process.env.DISABLE_JOURNAL          !== "true",
  STORY_ENGINE:     process.env.DISABLE_STORY_ENGINE     !== "true",
  PLUGIN_SYSTEM:    process.env.DISABLE_PLUGIN_SYSTEM    !== "true",
  OFFLINE_SYNC:     process.env.DISABLE_OFFLINE_SYNC     !== "true",
  MULTI_RELATIONSHIP: process.env.DISABLE_MULTI_REL     !== "true",
};

// ── Rate limits ────────────────────────────────────────────────────────────
export const RATE_LIMITS = {
  LOGIN_WINDOW_MS:   15 * 60 * 1000,  // 15 minutes
  LOGIN_MAX:         10,
  API_WINDOW_MS:     60 * 1000,        // 1 minute
  API_MAX:           120,
  UPLOAD_WINDOW_MS:  60 * 1000,
  UPLOAD_MAX:        20,
  MESSAGE_WINDOW_MS: 10 * 1000,
  MESSAGE_MAX:       30,
};

// ── Media limits (bytes) ───────────────────────────────────────────────────
export const MEDIA_LIMITS = {
  IMAGE: (parseInt(process.env.MAX_IMAGE_MB, 10) || 10) * 1024 * 1024,
  VIDEO: (parseInt(process.env.MAX_VIDEO_MB, 10) || 100) * 1024 * 1024,
  AUDIO: (parseInt(process.env.MAX_AUDIO_MB, 10) || 20) * 1024 * 1024,
  FILE:  (parseInt(process.env.MAX_FILE_MB,  10) || 50) * 1024 * 1024,
};

// ── Pagination defaults ────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
};

// ── JWT ────────────────────────────────────────────────────────────────────
export const JWT = {
  EXPIRY:      "7d",
  SALT_ROUNDS: 10,
};

// ── Environment ────────────────────────────────────────────────────────────
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEV:        process.env.NODE_ENV !== "production",
  PORT:          parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL:    process.env.CLIENT_URL || "http://localhost:5173",
};
