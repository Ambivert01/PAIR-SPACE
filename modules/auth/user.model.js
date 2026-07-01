import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    language: {
      type: String,
      default: "en",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    location: {
      lat:  { type: Number },
      lng:  { type: Number },
      city: { type: String, maxlength: 80 },
    },
    onboarding: {
      completed: {
        type: Boolean,
        default: false,
      },
      currentStep: {
        type: String,
        enum: ["welcome", "personalization", "feature_tour", "completed"],
        default: "welcome",
      },
      skippedSteps: {
        type: [String],
        default: [],
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
