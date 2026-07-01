/**
 * Alerting System
 *
 * Monitors critical metrics and sends alerts when thresholds are exceeded.
 * Supports multiple alert channels (console, webhook, email, etc.)
 */

import logger from "../../../../shared/utils/logger.js";
import { captureMessage } from "../config/sentry.js";

class AlertingSystem {
  constructor() {
    this.metrics = {
      errorCount: 0,
      slowRequestCount: 0,
      dbConnectionFailures: 0,
      aiFailures: 0,
      mediaUploadFailures: 0,
      socketDisconnects: 0,
    };

    this.thresholds = {
      errorRate: parseInt(process.env.ALERT_ERROR_RATE || "10"), // errors per minute
      slowRequestRate: parseInt(process.env.ALERT_SLOW_REQUEST_RATE || "20"), // slow requests per minute
      dbFailureRate: parseInt(process.env.ALERT_DB_FAILURE_RATE || "3"), // failures per minute
      aiFailureRate: parseInt(process.env.ALERT_AI_FAILURE_RATE || "5"), // failures per minute
      mediaFailureRate: parseInt(process.env.ALERT_MEDIA_FAILURE_RATE || "5"), // failures per minute
    };

    this.alertCooldown = new Map(); // Prevent alert spam
    this.cooldownPeriod = 5 * 60 * 1000; // 5 minutes

    // Reset metrics every minute
    setInterval(() => this.resetMetrics(), 60 * 1000);
  }

  /**
   * Track error occurrence
   */
  trackError(error, context = {}) {
    this.metrics.errorCount++;

    // Check if error rate threshold exceeded
    if (this.metrics.errorCount >= this.thresholds.errorRate) {
      this.sendAlert("HIGH_ERROR_RATE", {
        errorCount: this.metrics.errorCount,
        threshold: this.thresholds.errorRate,
        error: error.message,
        ...context,
      });
    }
  }

  /**
   * Track slow request
   */
  trackSlowRequest(path, durationMs, context = {}) {
    this.metrics.slowRequestCount++;

    // Check if slow request rate threshold exceeded
    if (this.metrics.slowRequestCount >= this.thresholds.slowRequestRate) {
      this.sendAlert("HIGH_SLOW_REQUEST_RATE", {
        slowRequestCount: this.metrics.slowRequestCount,
        threshold: this.thresholds.slowRequestRate,
        path,
        durationMs,
        ...context,
      });
    }
  }

  /**
   * Track database connection failure
   */
  trackDbFailure(error, context = {}) {
    this.metrics.dbConnectionFailures++;

    // Always alert on DB failures (critical)
    this.sendAlert(
      "DATABASE_CONNECTION_FAILURE",
      {
        failureCount: this.metrics.dbConnectionFailures,
        error: error.message,
        ...context,
      },
      "critical",
    );
  }

  /**
   * Track AI processing failure
   */
  trackAiFailure(operation, error, context = {}) {
    this.metrics.aiFailures++;

    // Check if AI failure rate threshold exceeded
    if (this.metrics.aiFailures >= this.thresholds.aiFailureRate) {
      this.sendAlert("HIGH_AI_FAILURE_RATE", {
        aiFailureCount: this.metrics.aiFailures,
        threshold: this.thresholds.aiFailureRate,
        operation,
        error: error.message,
        ...context,
      });
    }
  }

  /**
   * Track media upload failure
   */
  trackMediaFailure(mediaType, error, context = {}) {
    this.metrics.mediaUploadFailures++;

    // Check if media failure rate threshold exceeded
    if (this.metrics.mediaUploadFailures >= this.thresholds.mediaFailureRate) {
      this.sendAlert("HIGH_MEDIA_FAILURE_RATE", {
        mediaFailureCount: this.metrics.mediaUploadFailures,
        threshold: this.thresholds.mediaFailureRate,
        mediaType,
        error: error.message,
        ...context,
      });
    }
  }

  /**
   * Track socket disconnect
   */
  trackSocketDisconnect(reason, context = {}) {
    this.metrics.socketDisconnects++;

    // Log but don't alert (disconnects are normal)
    logger.debug("Socket disconnect tracked", {
      disconnectCount: this.metrics.socketDisconnects,
      reason,
      ...context,
    });
  }

  /**
   * Send alert through configured channels
   */
  sendAlert(alertType, data, severity = "warning") {
    // Check cooldown to prevent spam
    const cooldownKey = `${alertType}:${severity}`;
    const lastAlert = this.alertCooldown.get(cooldownKey);
    const now = Date.now();

    if (lastAlert && now - lastAlert < this.cooldownPeriod) {
      logger.debug("Alert suppressed (cooldown)", { alertType, severity });
      return;
    }

    // Update cooldown
    this.alertCooldown.set(cooldownKey, now);

    // Log alert
    logger.error(`ALERT [${severity.toUpperCase()}]: ${alertType}`, {
      category: "alert",
      alertType,
      severity,
      ...data,
    });

    // Send to Sentry
    captureMessage(
      `Alert: ${alertType}`,
      severity === "critical" ? "error" : "warning",
      data,
    );

    // Send to webhook (if configured)
    this.sendWebhookAlert(alertType, data, severity);

    // Send to email (if configured)
    // this.sendEmailAlert(alertType, data, severity);

    // Send to Slack/Discord (if configured)
    // this.sendSlackAlert(alertType, data, severity);
  }

  /**
   * Send alert to webhook
   */
  async sendWebhookAlert(alertType, data, severity) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertType,
          severity,
          timestamp: new Date().toISOString(),
          data,
        }),
      });

      if (!response.ok) {
        logger.error("Failed to send webhook alert", {
          status: response.status,
          alertType,
        });
      }
    } catch (error) {
      logger.error("Webhook alert error", {
        error: error.message,
        alertType,
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (called every minute)
   */
  resetMetrics() {
    this.metrics = {
      errorCount: 0,
      slowRequestCount: 0,
      dbConnectionFailures: 0,
      aiFailures: 0,
      mediaUploadFailures: 0,
      socketDisconnects: 0,
    };
  }

  /**
   * Manual health check
   */
  async performHealthCheck() {
    const checks = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: {},
    };

    // Check database
    try {
      const mongoose = await import("mongoose");
      checks.checks.database = {
        status: mongoose.connection.readyState === 1 ? "healthy" : "unhealthy",
        readyState: mongoose.connection.readyState,
      };
    } catch (error) {
      checks.checks.database = {
        status: "unhealthy",
        error: error.message,
      };
      checks.status = "unhealthy";
    }

    // Check Redis (if configured)
    try {
      const redis = process.env.REDIS_URL;
      if (redis) {
        // Add Redis health check here
        checks.checks.redis = { status: "unknown" };
      }
    } catch (error) {
      checks.checks.redis = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Check metrics
    checks.checks.metrics = this.getMetrics();

    // Overall status
    if (Object.values(checks.checks).some((c) => c.status === "unhealthy")) {
      checks.status = "unhealthy";
      this.sendAlert("HEALTH_CHECK_FAILED", checks, "critical");
    }

    return checks;
  }
}

// Singleton instance
const alerting = new AlertingSystem();

export default alerting;
