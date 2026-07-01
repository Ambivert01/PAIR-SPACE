/**
 * Analytics Routes
 *
 * API endpoints for tracking user behavior and generating insights
 */

import express from "express";
import AnalyticsEvent from "./analytics.model.js";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import adminMiddleware from "../../services/api/src/middleware/adminMiddleware.js";
import logger from "../../shared/utils/logger.js";

const router = express.Router();

// Track event
router.post("/track", authMiddleware, async (req, res) => {
  try {
    const {
      eventType,
      eventCategory,
      metadata,
      sessionId,
      deviceInfo,
      page,
      referrer,
      duration,
      loadTime,
    } = req.body;

    // Validation
    if (!eventType || !eventCategory) {
      return res.status(400).json({
        error: "eventType and eventCategory are required",
      });
    }

    // Create event
    await AnalyticsEvent.create({
      userId: req.user.userId,
      relationshipId: req.body.relationshipId,
      eventType,
      eventCategory,
      metadata: metadata || {},
      sessionId,
      userAgent: req.headers["user-agent"],
      deviceInfo,
      page,
      referrer,
      duration,
      loadTime,
    });

    // Don't wait for response, fire and forget
    res.status(202).json({ tracked: true });
  } catch (error) {
    // Log but don't fail - analytics shouldn't break user experience
    logger.error("Failed to track event", {
      context: "analytics",
      error: error.message,
      eventType: req.body.eventType,
    });
    res.status(202).json({ tracked: false });
  }
});

// Batch track events
router.post("/track/batch", authMiddleware, async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "events array is required" });
    }

    // Limit batch size
    if (events.length > 50) {
      return res.status(400).json({ error: "Maximum 50 events per batch" });
    }

    // Prepare events
    const analyticsEvents = events.map((event) => ({
      userId: req.user.userId,
      relationshipId: event.relationshipId,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      metadata: event.metadata || {},
      sessionId: event.sessionId,
      userAgent: req.headers["user-agent"],
      deviceInfo: event.deviceInfo,
      page: event.page,
      referrer: event.referrer,
      duration: event.duration,
      loadTime: event.loadTime,
      createdAt: event.timestamp || new Date(),
    }));

    await AnalyticsEvent.insertMany(analyticsEvents, { ordered: false });

    res.status(202).json({ tracked: events.length });
  } catch (error) {
    logger.error("Failed to track batch events", {
      context: "analytics",
      error: error.message,
    });
    res.status(202).json({ tracked: 0 });
  }
});

// Admin: Get analytics dashboard
router.get("/admin/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage =
      Object.keys(dateFilter).length > 0
        ? { $match: { createdAt: dateFilter } }
        : { $match: {} };

    const stats = await AnalyticsEvent.aggregate([
      matchStage,
      {
        $facet: {
          // Daily active users
          dailyActiveUsers: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                },
                users: { $addToSet: "$userId" },
              },
            },
            {
              $project: {
                date: "$_id.date",
                count: { $size: "$users" },
              },
            },
            { $sort: { date: -1 } },
            { $limit: 30 },
          ],
          // Event counts by type
          eventsByType: [
            { $group: { _id: "$eventType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          // Event counts by category
          eventsByCategory: [
            { $group: { _id: "$eventCategory", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // Feature usage
          featureUsage: [
            {
              $match: {
                eventCategory: {
                  $in: [
                    "messaging",
                    "memories",
                    "activities",
                    "games",
                    "planner",
                    "gifts",
                    "journal",
                    "ai",
                  ],
                },
              },
            },
            { $group: { _id: "$eventCategory", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // Average session duration
          avgSessionDuration: [
            {
              $match: {
                eventType: "session_end",
                duration: { $exists: true },
              },
            },
            {
              $group: {
                _id: null,
                avgDuration: { $avg: "$duration" },
                count: { $sum: 1 },
              },
            },
          ],
          // Total events
          totalEvents: [{ $count: "count" }],
          // Unique users
          uniqueUsers: [{ $group: { _id: "$userId" } }, { $count: "count" }],
        },
      },
    ]);

    res.json({
      stats: stats[0],
      period: {
        startDate: startDate || "all time",
        endDate: endDate || "now",
      },
    });
  } catch (error) {
    logger.error("Failed to fetch dashboard", {
      context: "analytics",
      error: error.message,
    });
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Admin: Get user journey
router.get("/admin/user/:userId/journey", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const events = await AnalyticsEvent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("-userAgent -deviceInfo");

    res.json({ events });
  } catch (error) {
    logger.error("Failed to fetch user journey", {
      context: "analytics",
      error: error.message,
    });
    res.status(500).json({ error: "Failed to fetch user journey" });
  }
});

// Admin: Get retention metrics
router.get("/admin/retention", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    // Get users who signed up in the last N days
    const signupDate = new Date();
    signupDate.setDate(signupDate.getDate() - parseInt(days));

    const signups = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: "signup",
          createdAt: { $gte: signupDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          users: { $addToSet: "$userId" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Calculate retention for each cohort
    const retention = [];
    for (const cohort of signups) {
      const cohortDate = new Date(cohort._id.date);
      const nextDay = new Date(cohortDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayEnd = new Date(nextDay);
      nextDayEnd.setDate(nextDayEnd.getDate() + 1);

      const returnedUsers = await AnalyticsEvent.distinct("userId", {
        userId: { $in: cohort.users },
        createdAt: { $gte: nextDay, $lt: nextDayEnd },
      });

      retention.push({
        date: cohort._id.date,
        signups: cohort.users.length,
        returned: returnedUsers.length,
        retentionRate:
          cohort.users.length > 0
            ? (returnedUsers.length / cohort.users.length) * 100
            : 0,
      });
    }

    res.json({ retention });
  } catch (error) {
    logger.error("Failed to fetch retention metrics", {
      context: "analytics",
      error: error.message,
    });
    res.status(500).json({ error: "Failed to fetch retention" });
  }
});

// Admin: Get activation funnel
router.get("/admin/activation", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const funnel = await AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          eventType: {
            $in: [
              "signup",
              "onboarding_completed",
              "relationship_created",
              "message_sent",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            eventType: "$eventType",
          },
        },
      },
      {
        $group: {
          _id: "$_id.eventType",
          count: { $sum: 1 },
        },
      },
    ]);

    const funnelMap = {};
    funnel.forEach((step) => {
      funnelMap[step._id] = step.count;
    });

    const result = {
      signup: funnelMap.signup || 0,
      onboarding_completed: funnelMap.onboarding_completed || 0,
      relationship_created: funnelMap.relationship_created || 0,
      message_sent: funnelMap.message_sent || 0,
    };

    // Calculate conversion rates
    result.onboarding_rate =
      result.signup > 0
        ? (result.onboarding_completed / result.signup) * 100
        : 0;
    result.activation_rate =
      result.signup > 0
        ? (result.relationship_created / result.signup) * 100
        : 0;
    result.engagement_rate =
      result.relationship_created > 0
        ? (result.message_sent / result.relationship_created) * 100
        : 0;

    res.json({ funnel: result });
  } catch (error) {
    logger.error("Failed to fetch activation funnel", {
      context: "analytics",
      error: error.message,
    });
    res.status(500).json({ error: "Failed to fetch activation funnel" });
  }
});

export default router;
