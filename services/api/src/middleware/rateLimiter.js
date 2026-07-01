import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "../../../../shared/config/appConfig.js";

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message, code: "RATE_LIMITED" } },
  });

export const loginLimiter   = make(RATE_LIMITS.LOGIN_WINDOW_MS,   RATE_LIMITS.LOGIN_MAX,   "Too many login attempts. Try again later.");
export const apiLimiter     = make(RATE_LIMITS.API_WINDOW_MS,     RATE_LIMITS.API_MAX,     "Too many requests. Slow down.");
export const uploadLimiter  = make(RATE_LIMITS.UPLOAD_WINDOW_MS,  RATE_LIMITS.UPLOAD_MAX,  "Too many uploads. Try again shortly.");
export const messageLimiter = make(RATE_LIMITS.MESSAGE_WINDOW_MS, RATE_LIMITS.MESSAGE_MAX, "Sending too fast. Slow down.");
