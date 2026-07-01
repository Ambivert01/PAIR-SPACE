/**
 * Analytics Service
 *
 * Client-side analytics tracking for beta testing
 */

import api from "../api.js";

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    this.flushInterval = null;
    this.isEnabled = true;
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getDeviceInfo() {
    return {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: this.getBrowserName(),
      os: this.getOSName(),
      device: this.getDeviceType(),
    };
  }

  getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  }

  getOSName() {
    const ua = navigator.userAgent;
    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return "Unknown";
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  /**
   * Track an event
   */
  track(eventType, eventCategory, metadata = {}) {
    if (!this.isEnabled) return;

    const event = {
      eventType,
      eventCategory,
      metadata,
      sessionId: this.sessionId,
      deviceInfo: this.getDeviceInfo(),
      page: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    this.eventQueue.push(event);

    // Flush if queue is large
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  trackPageView(page) {
    this.track("page_view", "navigation", { page });
  }

  /**
   * Track session start
   */
  trackSessionStart() {
    this.track("session_start", "engagement", {
      sessionId: this.sessionId,
    });
  }

  /**
   * Track session end
   */
  trackSessionEnd(duration) {
    this.track("session_end", "engagement", {
      sessionId: this.sessionId,
      duration,
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(feature, action, metadata = {}) {
    const categoryMap = {
      chat: "messaging",
      message: "messaging",
      memory: "memories",
      activity: "activities",
      game: "games",
      planner: "planner",
      gift: "gifts",
      journal: "journal",
      ai: "ai",
    };

    const category = categoryMap[feature] || "engagement";
    this.track(`${feature}_${action}`, category, metadata);
  }

  /**
   * Track user action
   */
  trackAction(action, category = "engagement", metadata = {}) {
    this.track(action, category, metadata);
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    this.track("error_occurred", "error", {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Flush events to server
   */
  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await api.post("/api/analytics/track/batch", { events });
    } catch (error) {
      console.error("Failed to send analytics:", error);
      // Don't retry - analytics shouldn't block user experience
    }
  }

  /**
   * Start auto-flush interval
   */
  startAutoFlush(intervalMs = 30000) {
    this.stopAutoFlush();
    this.flushInterval = setInterval(() => {
      this.flush();
    }, intervalMs);
  }

  /**
   * Stop auto-flush interval
   */
  stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Auto-flush every 30 seconds
analyticsService.startAutoFlush(30000);

// Flush on page unload
window.addEventListener("beforeunload", () => {
  analyticsService.flush();
});

export default analyticsService;

// Convenience exports
export const trackEvent = (eventType, eventCategory, metadata) =>
  analyticsService.track(eventType, eventCategory, metadata);

export const trackPageView = (page) => analyticsService.trackPageView(page);

export const trackFeature = (feature, action, metadata) =>
  analyticsService.trackFeature(feature, action, metadata);

export const trackAction = (action, category, metadata) =>
  analyticsService.trackAction(action, category, metadata);

export const trackError = (error, context) =>
  analyticsService.trackError(error, context);
