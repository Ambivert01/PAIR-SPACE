import logger from "../../../../shared/utils/logger.js";

/**
 * Enhanced request logger middleware using Winston
 * Logs all HTTP requests with timing, status, and user context
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request start (debug level)
  logger.debug(`→ ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("user-agent"),
  });

  // Log response when finished
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
      userId: req.user?.userId || null,
      ip: req.ip || req.connection.remoteAddress,
    };

    // Warn on slow requests (>500ms)
    if (durationMs > 500) {
      logger.warn(`Slow request: ${req.method} ${req.path}`, {
        ...logData,
        slow: true,
        threshold: 500,
      });
    } else {
      logger[level](`${req.method} ${req.path}`, logData);
    }

    // Log performance metrics
    if (durationMs > 100) {
      logger.logPerformance(`${req.method} ${req.path}`, durationMs, {
        status: res.statusCode,
        userId: req.user?.userId,
      });
    }
  });

  next();
};

// Legacy log function for backward compatibility
export const log = (level, message, meta = {}) => {
  logger[level](message, meta);
};
