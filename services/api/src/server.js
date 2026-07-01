import "dotenv/config";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import connectDB, { closeDB } from "./config/db.js";
import initSocket from "./config/socket.js";
import healthRouter from "./routes/health.js";
import {
  apiLimiter,
  loginLimiter,
  uploadLimiter,
} from "./middleware/rateLimiter.js";
import authRouter from "../../../modules/auth/auth.routes.js";
import relationshipRouter from "../../../modules/relationship/relationship.routes.js";
import chatRouter from "../../../modules/chat/chat.routes.js";
import mediaRouter from "../../../modules/media/media.routes.js";
import memoryRouter from "../../../modules/memory/memory.routes.js";
import callRouter from "../../../modules/call/call.routes.js";
import activityRouter from "../../../modules/sync/activity.routes.js";
import plannerRouter from "../../../modules/planner/plan.routes.js";
import notificationRouter from "../../../modules/notification/notification.routes.js";
import aiRouter from "../../../modules/ai/ai.routes.js";
import gameRouter from "../../../modules/games/game.routes.js";
import settingsRouter from "../../../modules/settings/settings.routes.js";
import searchRouter from "../../../modules/search/search.routes.js";
import privacyRouter from "../../../modules/privacy/privacy.routes.js";
import personalizationRouter from "../../../modules/personalization/personalization.routes.js";
import insightRouter from "../../../modules/insights/insight.routes.js";
import storyRouter from "../../../modules/ai-story/story.routes.js";
import syncRouter from "../../../modules/sync-engine/sync.routes.js";
import pluginRouter from "../../../modules/plugin-system/plugin.routes.js";
import { initPlugins } from "../../../modules/plugin-system/plugin.loader.js";
import journalRouter from "../../../modules/journal/journal.routes.js";
import giftRouter from "../../../modules/gifts/gift.routes.js";
import capsuleRouter from "../../../modules/time-capsule/capsule.routes.js";
import { initInsightScheduler } from "../../../modules/insights/insight.scheduler.js";
import onboardingRouter from "../../../modules/onboarding/onboarding.routes.js";
import feedbackRouter from "../../../modules/feedback/feedback.routes.js";
import analyticsRouter from "../../../modules/analytics/analytics.routes.js";
import heartbeatRouter from "../../../modules/heartbeat/heartbeat.routes.js";
import moodRouter from "../../../modules/mood/mood.routes.js";
import timezoneRouter from "../../../modules/timezone/timezone.routes.js";
import { requestLogger } from "./middleware/requestLogger.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorMiddleware.js";
import { ensureIndexes } from "./config/indexes.js";
import { runMigrations } from "./config/migrations.js";
import logger from "../../../shared/utils/logger.js";
import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
} from "./config/sentry.js";
import socketMonitor from "./utils/socketMonitor.js";
import alerting from "./utils/alerting.js";
import { initScheduler } from "../../../modules/notification/notification.scheduler.js";
import { initAnniversaryScheduler } from "../../../modules/notification/anniversary.scheduler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_PATH = path.join(__dirname, "../uploads");

const app = express();
const httpServer = http.createServer(app);

// Initialize Sentry (must be first)
initSentry(app);

// Sentry request handler (must be first middleware)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options(
  "*",
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);
app.use("/uploads", express.static(UPLOADS_PATH));

// global rate limit
app.use("/api", apiLimiter);

// routes
app.use("/", healthRouter);
app.get("/", (_req, res) =>
  res.json({ status: "ok", service: "pairspace-api" }),
);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", loginLimiter, authRouter);
app.use("/api/relationship", relationshipRouter);
app.use("/api/chat", chatRouter);
app.use("/api/media", uploadLimiter, mediaRouter);
app.use("/api/memory", memoryRouter);
app.use("/api/call", callRouter);
app.use("/api/activity", activityRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiRouter);
app.use("/api/games", gameRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/search", searchRouter);
app.use("/api/privacy", privacyRouter);
app.use("/api/personalization", personalizationRouter);
app.use("/api/insights", insightRouter);
app.use("/api/stories", storyRouter);
app.use("/api/sync", syncRouter);
app.use("/api/plugins", pluginRouter);
app.use("/api/journal", journalRouter);
app.use("/api/gifts", giftRouter);
app.use("/api/capsules", capsuleRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/heartbeat", heartbeatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/timezone", timezoneRouter);

// 404 handler
app.use(notFoundHandler);

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// Global error handler (must be last)
app.use(globalErrorHandler);

// socket
const io = initSocket(httpServer);

// scheduled notifications
// start
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await runMigrations();
    await ensureIndexes();
    httpServer.listen(PORT, () => {
      logger.info(`API server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
      });
      initScheduler(io);
      initInsightScheduler();
      initAnniversaryScheduler();
      initPlugins();

      // Log socket metrics every 5 minutes
      setInterval(
        () => {
          socketMonitor.logMetricsSummary();
        },
        5 * 60 * 1000,
      );
    });
  })
  .catch((error) => {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    alerting.trackDbFailure(error);
    process.exit(1);
  });

// ── Graceful shutdown ──────────────────────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    await closeDB();
    logger.info("Server shut down successfully");
    process.exit(0);
  });
  // force exit after 10s if stuck
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ── Unhandled error safety net ─────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason?.message || String(reason),
    stack: reason?.stack,
  });
  alerting.trackError(
    reason instanceof Error ? reason : new Error(String(reason)),
  );
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });
  alerting.trackError(err);
  process.exit(1);
});
