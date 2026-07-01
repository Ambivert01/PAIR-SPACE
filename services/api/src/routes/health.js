import { Router } from "express";
import mongoose from "mongoose";
import socketMonitor from "../utils/socketMonitor.js";
import alerting from "../utils/alerting.js";

const router = Router();
const started = Date.now();

/**
 * Basic health check endpoint
 * Returns service status, database status, and uptime
 */
const health = (_req, res) => {
  const db = mongoose.connection.readyState;
  const dbStatus =
    ["disconnected", "connected", "connecting", "disconnecting"][db] ||
    "unknown";
  const status = db === 1 ? "ok" : "degraded";

  res.status(db === 1 ? 200 : 503).json({
    status,
    db: dbStatus,
    uptime: Math.floor((Date.now() - started) / 1000),
    ts: new Date().toISOString(),
  });
};

/**
 * Detailed health check endpoint
 * Returns comprehensive system health information
 */
const detailedHealth = async (_req, res) => {
  const db = mongoose.connection.readyState;
  const dbStatus =
    ["disconnected", "connected", "connecting", "disconnecting"][db] ||
    "unknown";
  const status = db === 1 ? "ok" : "degraded";

  // Get socket metrics
  const socketMetrics = socketMonitor.getMetrics();

  // Get alert metrics
  const alertMetrics = alerting.getMetrics();

  // Memory usage
  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  res.status(db === 1 ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - started) / 1000),
    database: {
      status: dbStatus,
      readyState: db,
    },
    sockets: {
      active: socketMetrics.activeConnections,
      total: socketMetrics.totalConnections,
      disconnects: socketMetrics.totalDisconnects,
      errors: socketMetrics.totalErrors,
      byNamespace: socketMetrics.connectionsByNamespace,
    },
    alerts: {
      errors: alertMetrics.errorCount,
      slowRequests: alertMetrics.slowRequestCount,
      dbFailures: alertMetrics.dbConnectionFailures,
      aiFailures: alertMetrics.aiFailures,
      mediaFailures: alertMetrics.mediaUploadFailures,
    },
    system: {
      memory: memoryMB,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    },
  });
};

/**
 * Readiness probe (for Kubernetes/Docker)
 * Returns 200 if service is ready to accept traffic
 */
const readiness = (_req, res) => {
  const db = mongoose.connection.readyState;

  if (db === 1) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: "Database not connected" });
  }
};

/**
 * Liveness probe (for Kubernetes/Docker)
 * Returns 200 if service is alive (even if degraded)
 */
const liveness = (_req, res) => {
  res.status(200).json({ alive: true });
};

router.get("/health", health);
router.get("/api/health", health);
router.get("/api/health/detailed", detailedHealth);
router.get("/api/health/ready", readiness);
router.get("/api/health/live", liveness);

export default router;
