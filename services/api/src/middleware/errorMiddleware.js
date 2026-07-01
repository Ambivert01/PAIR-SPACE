import { ENV } from "../../../../shared/config/appConfig.js";
import logger from "../../../../shared/utils/logger.js";
import { captureException } from "../config/sentry.js";

export const globalErrorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || "SERVER_ERROR";
  const message = err.message || "An unexpected error occurred";

  // Log error with context
  logger.error(`Error: ${message}`, {
    code,
    status,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
    stack: err.stack,
    error: {
      name: err.name,
      message: err.message,
    },
  });

  // Send to Sentry if 5xx error
  if (status >= 500) {
    captureException(err, {
      path: req.path,
      method: req.method,
      userId: req.user?.userId,
      body: req.body,
      query: req.query,
    });
  }

  // Send response
  res.status(status).json({
    success: false,
    error: {
      message,
      code,
      ...(ENV.IS_PRODUCTION ? {} : { stack: err.stack }), // Include stack in dev only
    },
  });
};

export const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userId: req.user?.userId,
  });

  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
};
