export const ERROR_CODES = {
  UNAUTHORIZED:      "UNAUTHORIZED",
  FORBIDDEN:         "FORBIDDEN",
  NOT_FOUND:         "NOT_FOUND",
  VALIDATION_ERROR:  "VALIDATION_ERROR",
  CONFLICT:          "CONFLICT",
  RATE_LIMITED:      "RATE_LIMITED",
  SERVER_ERROR:      "SERVER_ERROR",
  RELATIONSHIP_REQUIRED: "RELATIONSHIP_REQUIRED",
  MEDIA_ERROR:       "MEDIA_ERROR",
};

export const createError = (message, code = ERROR_CODES.SERVER_ERROR, status = 500) => {
  const err = new Error(message);
  err.code   = code;
  err.status = status;
  return err;
};

// Express global error handler middleware
export const globalErrorHandler = (err, req, res, next) => {
  const status  = err.status || 500;
  const code    = err.code   || ERROR_CODES.SERVER_ERROR;
  const message = err.message || "An unexpected error occurred";

  // never leak stack traces in production
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${code}: ${message}`, err.stack?.split("\n")[1] || "");
  }

  res.status(status).json({
    success: false,
    error: { message, code },
  });
};

// Async route wrapper — eliminates try/catch boilerplate
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
