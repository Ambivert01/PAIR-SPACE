/**
 * Sentry Configuration for Frontend Error Tracking
 *
 * Initializes Sentry for React error monitoring.
 * Captures errors, performance metrics, and user interactions.
 */

import * as Sentry from "@sentry/react";

const IS_PRODUCTION = import.meta.env.PROD;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialize Sentry for React
 * Only enabled in production with valid DSN
 */
export function initSentry() {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    console.log("Sentry disabled (not production or no DSN configured)");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: import.meta.env.MODE || "production",

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",

    // Performance monitoring
    tracesSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "0.1",
    ), // 10% of transactions

    // Session replay (optional, captures user sessions for debugging)
    replaysSessionSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_REPLAY_SESSION_RATE || "0.1",
    ), // 10% of sessions
    replaysOnErrorSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_REPLAY_ERROR_RATE || "1.0",
    ), // 100% of sessions with errors

    integrations: [
      // Browser tracing for performance monitoring
      new Sentry.BrowserTracing({
        // Track navigation and route changes
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          window.React.useEffect,
          window.React.useLocation,
          window.React.useNavigationType,
          window.React.createRoutesFromChildren,
          window.React.matchRoutes,
        ),
      }),

      // Session replay for debugging
      new Sentry.Replay({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media for privacy
      }),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data) {
            const sensitiveFields = [
              "password",
              "token",
              "secret",
              "pin",
              "content",
            ];
            sensitiveFields.forEach((field) => {
              if (breadcrumb.data[field]) {
                breadcrumb.data[field] = "[REDACTED]";
              }
            });
          }
          return breadcrumb;
        });
      }

      // Remove sensitive data from request
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
      "Network request failed",
      "NetworkError",
      "Failed to fetch",

      // Browser extensions
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",

      // Third-party scripts
      "Script error",

      // User cancellations
      "AbortError",
      "The user aborted a request",
    ],

    // Ignore errors from certain URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  console.log("✓ Sentry initialized for error tracking");
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
    email: user.email,
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
 * Manually capture an exception
 */
export function captureException(error, context = {}) {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    console.error("Error:", error, context);
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
    console.log(`[${level}] ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
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
