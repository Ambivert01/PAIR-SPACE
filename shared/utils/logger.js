/**
 * Centralized Logger using Winston
 *
 * Provides structured logging with multiple transports:
 * - Console (development)
 * - File (production)
 * - Error file (errors only)
 *
 * Usage:
 *   import logger from './shared/utils/logger.js';
 *   logger.info('User logged in', { userId: '123' });
 *   logger.error('Database connection failed', { error: err.message });
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "../../logs");

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  winston.format.json(),
);

// Human-readable format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    let msg = `${timestamp} [${level}] ${message}`;

    // Add metadata if present (excluding sensitive fields)
    if (metadata && Object.keys(metadata).length > 0) {
      const sanitized = sanitizeMetadata(metadata);
      if (Object.keys(sanitized).length > 0) {
        msg += ` ${JSON.stringify(sanitized)}`;
      }
    }

    return msg;
  }),
);

// Sanitize sensitive data from logs
function sanitizeMetadata(metadata) {
  const sensitive = [
    "password",
    "token",
    "secret",
    "authorization",
    "cookie",
    "pin",
  ];
  const sanitized = { ...metadata };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitive.some((s) => lowerKey.includes(s))) {
      sanitized[key] = "[REDACTED]";
    }

    // Recursively sanitize nested objects
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeMetadata(sanitized[key]);
    }
  }

  return sanitized;
}

// Create transports based on environment
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: IS_PRODUCTION ? structuredFormat : consoleFormat,
    level: IS_PRODUCTION ? "info" : "debug",
  }),
);

// File transports (production only)
if (IS_PRODUCTION) {
  // All logs
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: structuredFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  );

  // Error logs only
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      format: structuredFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: IS_PRODUCTION ? "info" : "debug",
  format: structuredFormat,
  transports,
  exitOnError: false,
});

// Add helper methods for common logging patterns
logger.logAuth = (action, userId, success, metadata = {}) => {
  const level = success ? "info" : "warn";
  logger[level](`Auth: ${action}`, {
    category: "auth",
    action,
    userId,
    success,
    ...metadata,
  });
};

logger.logRelationship = (action, relationshipId, metadata = {}) => {
  logger.info(`Relationship: ${action}`, {
    category: "relationship",
    action,
    relationshipId,
    ...metadata,
  });
};

logger.logChat = (action, messageId, relationshipId, metadata = {}) => {
  logger.info(`Chat: ${action}`, {
    category: "chat",
    action,
    messageId,
    relationshipId,
    ...metadata,
  });
};

logger.logMedia = (action, mediaType, success, metadata = {}) => {
  const level = success ? "info" : "error";
  logger[level](`Media: ${action}`, {
    category: "media",
    action,
    mediaType,
    success,
    ...metadata,
  });
};

logger.logAI = (action, success, metadata = {}) => {
  const level = success ? "info" : "error";
  logger[level](`AI: ${action}`, {
    category: "ai",
    action,
    success,
    ...metadata,
  });
};

logger.logCall = (action, callId, metadata = {}) => {
  logger.info(`Call: ${action}`, {
    category: "call",
    action,
    callId,
    ...metadata,
  });
};

logger.logSync = (action, success, metadata = {}) => {
  const level = success ? "info" : "warn";
  logger[level](`Sync: ${action}`, {
    category: "sync",
    action,
    success,
    ...metadata,
  });
};

logger.logSocket = (event, socketId, metadata = {}) => {
  logger.debug(`Socket: ${event}`, {
    category: "socket",
    event,
    socketId,
    ...metadata,
  });
};

logger.logPerformance = (operation, durationMs, metadata = {}) => {
  const level = durationMs > 1000 ? "warn" : "info";
  logger[level](`Performance: ${operation}`, {
    category: "performance",
    operation,
    durationMs,
    slow: durationMs > 500,
    ...metadata,
  });
};

// Handle uncaught exceptions and unhandled rejections
if (IS_PRODUCTION) {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "exceptions.log"),
      format: structuredFormat,
    }),
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "rejections.log"),
      format: structuredFormat,
    }),
  );
}

export default logger;
