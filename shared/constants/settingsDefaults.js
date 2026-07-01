export const USER_SETTINGS_DEFAULTS = {
  appearance: {
    theme:          "dark",       // dark | light | romantic | minimal
    accentColor:    "indigo",     // indigo | purple | pink | neutral
    animationLevel: "normal",     // normal | reduced | disabled
  },
  notifications: {
    enableSound:              true,
    enableBrowserNotification:true,
    quietHoursEnabled:        false,
    quietStart:               "22:00",
    quietEnd:                 "08:00",
  },
  privacy: {
    showOnlineStatus:    true,
    showActivityStatus:  true,
    showTypingIndicator: true,
    allowLocationSharing:false,
    hideLastSeen:        false,
    allowMemoryAutoTag:  true,
  },
  ai: {
    enableSuggestions:         true,
    enableEmotionDetection:    true,
    enableConversationInsights:true,
    enableStressDetection:     true,
    enableMemoryAI:            true,
  },
  chat: {
    enterToSend:       true,
    showReadReceipts:  true,
    autoDownloadMedia: true,
  },
  calls: {
    autoEnableCamera:       false,
    autoEnableMic:          true,
    preferredVideoQuality:  "720p",
    echoCancellation:       true,
  },
  data: {
    autoBackup: false,
    autoSync:   true,
  },
};

export const RELATIONSHIP_SETTINGS_DEFAULTS = {
  sharedTheme:              "default",
  memoryVisibilityDefault:  "visible",
  allowGames:               true,
  allowAIInsights:          true,
  allowSharedActivities:    true,
  allowPlannerSuggestions:  true,
  anniversaryReminders:     true,
  customRelationshipName:   "",
  sharedWallpaper:          "",
};
