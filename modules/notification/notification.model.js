import mongoose from "mongoose";

const NOTIFICATION_TYPES = [
  "message_received","message_reaction","message_reply",
  "missed_call","incoming_call","call_reminder",
  "memory_created","memory_reaction","memory_comment",
  "activity_invite","activity_started","activity_reminder",
  "planner_reminder","habit_reminder","goal_progress",
  "anniversary_reminder","relationship_event",
  "presence_update","system_alert",
];

const notificationSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", default: null },
    type:           { type: String, enum: NOTIFICATION_TYPES, required: true },
    title:          { type: String, required: true, maxlength: 120 },
    message:        { type: String, default: "", maxlength: 300 },
    entityType:     { type: String, default: "" },
    entityId:       { type: mongoose.Schema.Types.ObjectId, default: null },
    read:           { type: Boolean, default: false },
    delivered:      { type: Boolean, default: false },
    priority:       { type: String, enum: ["low","normal","high","critical"], default: "normal" },
    scheduledFor:   { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, delivered: 1 });

const preferencesSchema = new mongoose.Schema(
  {
    userId:                  { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    messageNotifications:    { type: Boolean, default: true },
    callNotifications:       { type: Boolean, default: true },
    activityNotifications:   { type: Boolean, default: true },
    plannerNotifications:    { type: Boolean, default: true },
    memoryNotifications:     { type: Boolean, default: true },
    presenceNotifications:   { type: Boolean, default: false },
    muteAll:                 { type: Boolean, default: false },
    quietHoursEnabled:       { type: Boolean, default: false },
    quietStart:              { type: String, default: "22:00" },
    quietEnd:                { type: String, default: "08:00" },
  },
  { timestamps: true }
);

export const Notification   = mongoose.model("Notification", notificationSchema);
export const NotificationPreferences = mongoose.model("NotificationPreferences", preferencesSchema);
