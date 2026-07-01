import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const habitLogSchema = new mongoose.Schema({
  date:      { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

const planSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["event","reminder","goal","habit","routine","task","milestone_plan","trip_plan","study_plan","health_plan","custom_plan"],
      required: true,
    },
    title:       { type: String, required: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 1000 },
    startDate:   { type: Date, default: null },
    endDate:     { type: Date, default: null },
    dueDate:     { type: Date, default: null },
    recurrence:  { type: String, enum: ["none","daily","weekly","monthly","yearly","custom"], default: "none" },
    priority:    { type: String, enum: ["low","medium","high","important"], default: "medium" },
    status:      { type: String, enum: ["pending","active","completed","cancelled","missed","paused"], default: "pending" },
    progress:    { type: Number, min: 0, max: 100, default: 0 },
    tags:        [{ type: String, maxlength: 40 }],
    participants:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    visibility:  { type: String, enum: ["shared","private"], default: "shared" },
    deleted:     { type: Boolean, default: false },

    // habit-specific
    streakCount:   { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    habitLogs:     [habitLogSchema],

    // trip-specific
    checklist: [checklistItemSchema],

    // reminder
    reminderSettings: {
      enabled:         { type: Boolean, default: false },
      reminderTimes:   [{ type: String }],
      notificationType:{ type: String, enum: ["push","in_app"], default: "in_app" },
    },
  },
  { timestamps: true }
);

planSchema.index({ relationshipId: 1, startDate: 1 });
planSchema.index({ relationshipId: 1, status: 1 });
planSchema.index({ relationshipId: 1, type: 1 });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
