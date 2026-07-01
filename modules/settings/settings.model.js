import mongoose from "mongoose";
import { USER_SETTINGS_DEFAULTS as D, RELATIONSHIP_SETTINGS_DEFAULTS as RD } from "../../shared/constants/settingsDefaults.js";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    appearance: {
      theme:          { type: String, enum: ["dark","light","romantic","minimal"], default: D.appearance.theme },
      accentColor:    { type: String, enum: ["indigo","purple","pink","neutral"],  default: D.appearance.accentColor },
      animationLevel: { type: String, enum: ["normal","reduced","disabled"],       default: D.appearance.animationLevel },
    },
    notifications: {
      enableSound:               { type: Boolean, default: D.notifications.enableSound },
      enableBrowserNotification: { type: Boolean, default: D.notifications.enableBrowserNotification },
      quietHoursEnabled:         { type: Boolean, default: D.notifications.quietHoursEnabled },
      quietStart:                { type: String,  default: D.notifications.quietStart },
      quietEnd:                  { type: String,  default: D.notifications.quietEnd },
    },
    privacy: {
      showOnlineStatus:    { type: Boolean, default: D.privacy.showOnlineStatus },
      showActivityStatus:  { type: Boolean, default: D.privacy.showActivityStatus },
      showTypingIndicator: { type: Boolean, default: D.privacy.showTypingIndicator },
      allowLocationSharing:{ type: Boolean, default: D.privacy.allowLocationSharing },
      hideLastSeen:        { type: Boolean, default: D.privacy.hideLastSeen },
      allowMemoryAutoTag:  { type: Boolean, default: D.privacy.allowMemoryAutoTag },
    },
    ai: {
      enableSuggestions:          { type: Boolean, default: D.ai.enableSuggestions },
      enableEmotionDetection:     { type: Boolean, default: D.ai.enableEmotionDetection },
      enableConversationInsights: { type: Boolean, default: D.ai.enableConversationInsights },
      enableStressDetection:      { type: Boolean, default: D.ai.enableStressDetection },
      enableMemoryAI:             { type: Boolean, default: D.ai.enableMemoryAI },
    },
    chat: {
      enterToSend:       { type: Boolean, default: D.chat.enterToSend },
      showReadReceipts:  { type: Boolean, default: D.chat.showReadReceipts },
      autoDownloadMedia: { type: Boolean, default: D.chat.autoDownloadMedia },
    },
    calls: {
      autoEnableCamera:      { type: Boolean, default: D.calls.autoEnableCamera },
      autoEnableMic:         { type: Boolean, default: D.calls.autoEnableMic },
      preferredVideoQuality: { type: String,  default: D.calls.preferredVideoQuality },
      echoCancellation:      { type: Boolean, default: D.calls.echoCancellation },
    },
    data: {
      autoBackup: { type: Boolean, default: D.data.autoBackup },
      autoSync:   { type: Boolean, default: D.data.autoSync },
    },
  },
  { timestamps: true }
);

const relationshipSettingsSchema = new mongoose.Schema(
  {
    relationshipId:          { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", unique: true, required: true },
    sharedTheme:             { type: String, default: RD.sharedTheme },
    memoryVisibilityDefault: { type: String, enum: ["visible","hidden","private_note","locked"], default: RD.memoryVisibilityDefault },
    allowGames:              { type: Boolean, default: RD.allowGames },
    allowAIInsights:         { type: Boolean, default: RD.allowAIInsights },
    allowSharedActivities:   { type: Boolean, default: RD.allowSharedActivities },
    allowPlannerSuggestions: { type: Boolean, default: RD.allowPlannerSuggestions },
    anniversaryReminders:    { type: Boolean, default: RD.anniversaryReminders },
    customRelationshipName:  { type: String,  default: RD.customRelationshipName, maxlength: 60 },
    sharedWallpaper:         { type: String,  default: RD.sharedWallpaper },
  },
  { timestamps: true }
);

export const UserSettings         = mongoose.model("UserSettings", userSettingsSchema);
export const RelationshipSettings = mongoose.model("RelationshipSettings", relationshipSettingsSchema);
