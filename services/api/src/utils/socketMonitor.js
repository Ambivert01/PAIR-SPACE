/**
 * Socket.IO Monitoring Utility
 *
 * Tracks socket connections, disconnections, and errors
 * Provides metrics for monitoring socket health
 */

import logger from "../../../../shared/utils/logger.js";

class SocketMonitor {
  constructor() {
    this.connections = new Map(); // socketId -> connection info
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      totalDisconnects: 0,
      totalErrors: 0,
      totalReconnects: 0,
      messagesSent: 0,
      messagesReceived: 0,
    };
  }

  /**
   * Track new connection
   */
  onConnect(socket, namespace = "default") {
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    const connectionInfo = {
      socketId: socket.id,
      namespace,
      userId: socket.userId || null,
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    this.connections.set(socket.id, connectionInfo);

    logger.logSocket("connect", socket.id, {
      namespace,
      userId: socket.userId,
      totalActive: this.metrics.activeConnections,
    });
  }

  /**
   * Track disconnection
   */
  onDisconnect(socket, reason, namespace = "default") {
    this.metrics.totalDisconnects++;
    this.metrics.activeConnections--;

    const connectionInfo = this.connections.get(socket.id);
    const duration = connectionInfo
      ? Date.now() - connectionInfo.connectedAt.getTime()
      : 0;

    this.connections.delete(socket.id);

    logger.logSocket("disconnect", socket.id, {
      namespace,
      userId: socket.userId,
      reason,
      durationMs: duration,
      totalActive: this.metrics.activeConnections,
    });
  }

  /**
   * Track reconnection
   */
  onReconnect(socket, namespace = "default") {
    this.metrics.totalReconnects++;

    logger.logSocket("reconnect", socket.id, {
      namespace,
      userId: socket.userId,
      totalReconnects: this.metrics.totalReconnects,
    });
  }

  /**
   * Track socket error
   */
  onError(socket, error, namespace = "default") {
    this.metrics.totalErrors++;

    logger.error("Socket error", {
      category: "socket",
      socketId: socket.id,
      namespace,
      userId: socket.userId,
      error: error.message,
      stack: error.stack,
    });
  }

  /**
   * Track message sent
   */
  onMessageSent(socket, event, namespace = "default") {
    this.metrics.messagesSent++;

    const connectionInfo = this.connections.get(socket.id);
    if (connectionInfo) {
      connectionInfo.lastActivity = new Date();
    }

    logger.debug(`Socket message sent: ${event}`, {
      category: "socket",
      socketId: socket.id,
      namespace,
      event,
      userId: socket.userId,
    });
  }

  /**
   * Track message received
   */
  onMessageReceived(socket, event, namespace = "default") {
    this.metrics.messagesReceived++;

    const connectionInfo = this.connections.get(socket.id);
    if (connectionInfo) {
      connectionInfo.lastActivity = new Date();
    }

    logger.debug(`Socket message received: ${event}`, {
      category: "socket",
      socketId: socket.id,
      namespace,
      event,
      userId: socket.userId,
    });
  }

  /**
   * Track message delivery error
   */
  onDeliveryError(socket, event, error, namespace = "default") {
    this.metrics.totalErrors++;

    logger.error(`Socket delivery error: ${event}`, {
      category: "socket",
      socketId: socket.id,
      namespace,
      event,
      userId: socket.userId,
      error: error.message,
    });
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeConnections: this.metrics.activeConnections,
      connectionsByNamespace: this.getConnectionsByNamespace(),
    };
  }

  /**
   * Get connections grouped by namespace
   */
  getConnectionsByNamespace() {
    const byNamespace = {};

    for (const [socketId, info] of this.connections) {
      const ns = info.namespace;
      if (!byNamespace[ns]) {
        byNamespace[ns] = 0;
      }
      byNamespace[ns]++;
    }

    return byNamespace;
  }

  /**
   * Get stale connections (no activity for > 5 minutes)
   */
  getStaleConnections(thresholdMs = 5 * 60 * 1000) {
    const now = Date.now();
    const stale = [];

    for (const [socketId, info] of this.connections) {
      const inactiveMs = now - info.lastActivity.getTime();
      if (inactiveMs > thresholdMs) {
        stale.push({
          socketId,
          userId: info.userId,
          namespace: info.namespace,
          inactiveMs,
        });
      }
    }

    return stale;
  }

  /**
   * Log metrics summary (call periodically)
   */
  logMetricsSummary() {
    const metrics = this.getMetrics();
    const stale = this.getStaleConnections();

    logger.info("Socket metrics summary", {
      category: "socket",
      metrics,
      staleConnections: stale.length,
    });

    // Warn if too many stale connections
    if (stale.length > 10) {
      logger.warn("High number of stale socket connections", {
        category: "socket",
        count: stale.length,
        staleConnections: stale.slice(0, 5), // Log first 5
      });
    }
  }

  /**
   * Reset metrics (for testing or periodic reset)
   */
  resetMetrics() {
    this.metrics = {
      totalConnections: 0,
      activeConnections: this.connections.size,
      totalDisconnects: 0,
      totalErrors: 0,
      totalReconnects: 0,
      messagesSent: 0,
      messagesReceived: 0,
    };
  }
}

// Singleton instance
const socketMonitor = new SocketMonitor();

export default socketMonitor;
