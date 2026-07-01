import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import User from "../auth/user.model.js";

const router = Router();

/**
 * Get onboarding status
 * GET /api/onboarding/status
 */
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("onboarding");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found", code: "USER_NOT_FOUND" },
      });
    }

    res.json({
      success: true,
      data: {
        completed: user.onboarding?.completed || false,
        currentStep: user.onboarding?.currentStep || "welcome",
        skippedSteps: user.onboarding?.skippedSteps || [],
        completedAt: user.onboarding?.completedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get onboarding status",
        code: "SERVER_ERROR",
      },
    });
  }
});

/**
 * Update onboarding step
 * POST /api/onboarding/step
 */
router.post("/step", authMiddleware, async (req, res) => {
  try {
    const { step, skipped } = req.body;

    const validSteps = [
      "welcome",
      "personalization",
      "feature_tour",
      "completed",
    ];

    if (!validSteps.includes(step)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid step", code: "INVALID_STEP" },
      });
    }

    const updateData = {
      "onboarding.currentStep": step,
    };

    // If step is completed, mark onboarding as complete
    if (step === "completed") {
      updateData["onboarding.completed"] = true;
      updateData["onboarding.completedAt"] = new Date();
    }

    // Track skipped steps
    if (skipped) {
      updateData.$addToSet = { "onboarding.skippedSteps": step };
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
      new: true,
    }).select("onboarding");

    res.json({
      success: true,
      data: {
        completed: user.onboarding.completed,
        currentStep: user.onboarding.currentStep,
        skippedSteps: user.onboarding.skippedSteps,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update onboarding step",
        code: "SERVER_ERROR",
      },
    });
  }
});

/**
 * Complete onboarding
 * POST /api/onboarding/complete
 */
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        "onboarding.completed": true,
        "onboarding.currentStep": "completed",
        "onboarding.completedAt": new Date(),
      },
      { new: true },
    ).select("onboarding");

    res.json({
      success: true,
      data: {
        completed: user.onboarding.completed,
        completedAt: user.onboarding.completedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: "Failed to complete onboarding", code: "SERVER_ERROR" },
    });
  }
});

/**
 * Reset onboarding (for testing)
 * POST /api/onboarding/reset
 */
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        "onboarding.completed": false,
        "onboarding.currentStep": "welcome",
        "onboarding.skippedSteps": [],
        "onboarding.completedAt": null,
      },
      { new: true },
    ).select("onboarding");

    res.json({
      success: true,
      data: {
        completed: user.onboarding.completed,
        currentStep: user.onboarding.currentStep,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: "Failed to reset onboarding", code: "SERVER_ERROR" },
    });
  }
});

export default router;
