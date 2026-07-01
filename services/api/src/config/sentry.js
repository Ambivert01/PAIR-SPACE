/**
 * Sentry Configuration for Backend Error Tracking
 *
 * Initializes Sentry for production error monitoring.
 * Captures errors, performance metrics, and traces.
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SENTRY_DSN = process.env.SENTRY_DSN;

/**
 * Initialize Sentry
 * Only enabled in production with valid DSN
 */
export function initSentry(app) {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV || "production",

    // Release tracking (use git commit hash or version)
    release: process.env.RENDER_GIT_COMMIT || process.env.npm_package_version,

    // Performance monitoring
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1",
    ), // 10% of transactions

    // Profiling (optional, requires @sentry/profiling-node)
    profilesSampleRate: parseFloat(
      process.env.SENTRY_PROFILES_SAMPLE_RATE || "0.1",
    ), // 10% of transactions

    integrations: [
      // HTTP integration for Express
      new Sentry.Integrations.Http({ tracing: true }),

      // Express integration
      new Sentry.Integrations.Express({ app }),

      // Profiling integration (optional)
      nodeProfilingIntegration(),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive query params
      if (event.request?.query_string) {
        const sensitiveParams = ["token", "password", "secret", "pin"];
        sensitiveParams.forEach((param) => {
          if (event.request.query_string.includes(param)) {
            event.request.query_string = event.request.query_string.replace(
              new RegExp(`${param}=[^&]*`, "gi"),
              `${param}=[REDACTED]`,
            );
          }
        });
      }

      // Remove sensitive body data
      if (event.request?.data) {
        const data =
          typeof event.request.data === "string"
            ? JSON.parse(event.request.data)
            : event.request.data;

        const sensitiveFields = [
          "password",
          "token",
          "secret",
          "pin",
          "content",
        ];
        sensitiveFields.forEach((field) => {
          if (data[field]) {
            data[field] = "[REDACTED]";
          }
        });

        event.request.data = data;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",

      // Client errors (not server issues)
      "ValidationError",
      "CastError",

      // Rate limiting
      "Too many requests",
    ],
  });
}

/**
 * Request handler middleware (must be first)
 */
export const sentryRequestHandler = () => {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler();
};

/**
 * Tracing handler middleware (after request handler)
 */
export const sentryTracingHandler = () => {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
};

/**
 * Error handler middleware (must be after routes, before other error handlers)
 */
export const sentryErrorHandler = () => {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only send 5xx errors to Sentry
      return error.status >= 500 || !error.status;
    },
  });
};

/**
 * Manually capture an exception
 */
export function captureException(error, context = {}) {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message, level = "info", context = {}) {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user) {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return;
  }

  Sentry.setUser({
    id: user.userId,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category, data = {}) {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

export default Sentry;
