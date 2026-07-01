/**
 * Feedback Routes
 *
 * API endpoints for collecting user feedback during beta
 */

import express from "express";
import Feedback from "./feedback.model.js";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import adminMiddleware from "../../services/api/src/middleware/adminMiddleware.js";
import logger from "../../shared/utils/logger.js";

const router = express.Router();

// ── Submit feedback ────────────────────────────────────────────────────────
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const {
      type, category, title, description,
      likedMost, confusedBy, feltUnnecessary,
      mostUsedFeature, wouldImprove, rating,
      page, deviceInfo,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: true, message: "Title and description are required" });
    }

    const feedback = await Feedback.create({
      userId: req.user.userId,          // ← fixed: was req.user.id
      relationshipId: req.body.relationshipId,
      type: type || "feedback",
      category: category || "general",
      title, description, likedMost, confusedBy,
      feltUnnecessary, mostUsedFeature, wouldImprove,
      rating, page,
      userAgent: req.headers["user-agent"],
      deviceInfo,
      status: "new",
      priority: type === "bug" ? "high" : "medium",
    });

    logger.info("Feedback submitted", {
      context: "feedback",
      feedbackId: feedback._id,
      userId: req.user.userId,
      type, category,
    });

    res.status(201).json({ message: "Thank you for your feedback!", feedbackId: feedback._id });
  } catch (error) {
    logger.error("Failed to submit feedback", { context: "feedback", error: error.message });
    res.status(500).json({ error: true, message: "Failed to submit feedback" });
  }
});

// ── Get user's own feedback ────────────────────────────────────────────────
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.userId })  // ← fixed
      .sort({ createdAt: -1 })
      .select("-adminNotes -resolvedBy")
      .limit(50);
    res.json({ feedback });
  } catch (error) {
    logger.error("Failed to fetch user feedback", { context: "feedback", error: error.message });
    res.status(500).json({ error: true, message: "Failed to fetch feedback" });
  }
});

// ── Admin: Get all feedback (paginated) — requires admin role ─────────────
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, priority, category } = req.query;
    const query = {};
    if (type)     query.type     = type;
    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .populate("userId", "displayName email")
        .sort({ priority: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Feedback.countDocuments(query),
    ]);

    res.json({
      feedback,
      pagination: {
        page: parseInt(page), limit: parseInt(limit),
        total, pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch all feedback", { context: "feedback", error: error.message });
    res.status(500).json({ error: true, message: "Failed to fetch feedback" });
  }
});

// ── Admin: Update feedback status — requires admin role ───────────────────
router.patch("/admin/:feedbackId/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status, priority, adminNotes } = req.body;
    const update = {};
    if (status)     update.status     = status;
    if (priority)   update.priority   = priority;
    if (adminNotes) update.adminNotes = adminNotes;
    if (status === "resolved") {
      update.resolvedAt = new Date();
      update.resolvedBy = req.user.userId;
    }

    const feedback = await Feedback.findByIdAndUpdate(feedbackId, update, { new: true });
    if (!feedback) return res.status(404).json({ error: true, message: "Feedback not found" });

    logger.info("Feedback status updated", { context: "feedback", feedbackId, status, priority });
    res.json({ feedback });
  } catch (error) {
    logger.error("Failed to update feedback status", { context: "feedback", error: error.message });
    res.status(500).json({ error: true, message: "Failed to update feedback" });
  }
});

// ── Admin: Get feedback statistics — requires admin role ──────────────────
router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          byType:     [{ $group: { _id: "$type",     count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byStatus:   [{ $group: { _id: "$status",   count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          avgRating:  [
            { $match: { rating: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);
    res.json({ stats: stats[0], timestamp: new Date() });
  } catch (error) {
    logger.error("Failed to fetch feedback stats", { context: "feedback", error: error.message });
    res.status(500).json({ error: true, message: "Failed to fetch stats" });
  }
});

export default router;
