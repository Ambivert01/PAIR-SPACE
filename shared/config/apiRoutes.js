/**
 * PairSpace API Route Map
 * All routes follow: /api/{module}/{action}
 * Auth required on all routes unless marked [public]
 */

export const API_ROUTES = {
  // ── Auth ──────────────────────────────────────────────────────────────
  auth: {
    signup:        "POST   /api/auth/signup        [public]",
    login:         "POST   /api/auth/login         [public]",
    me:            "GET    /api/auth/me",
    profile:       "PATCH  /api/auth/profile",
    logout:        "POST   /api/auth/logout",
  },

  // ── Relationship ──────────────────────────────────────────────────────
  relationship: {
    invite:        "POST   /api/relationship/invite",
    accept:        "POST   /api/relationship/accept",
    reject:        "POST   /api/relationship/reject",
    cancel:        "POST   /api/relationship/cancel",
    end:           "POST   /api/relationship/end",
    my:            "GET    /api/relationship/my",
    list:          "GET    /api/relationship/list",
    byId:          "GET    /api/relationship/:id",
    rename:        "PATCH  /api/relationship/rename",
    archive:       "POST   /api/relationship/archive",
    pin:           "POST   /api/relationship/pin",
    mute:          "POST   /api/relationship/mute",
  },

  // ── Chat ──────────────────────────────────────────────────────────────
  chat: {
    messages:      "GET    /api/chat/messages/:relationshipId",
    search:        "GET    /api/chat/search/:relationshipId",
  },

  // ── Media ─────────────────────────────────────────────────────────────
  media: {
    upload:        "POST   /api/media/upload",
    get:           "GET    /api/media/:mediaId",
    delete:        "DELETE /api/media/:mediaId",
  },

  // ── Memory ────────────────────────────────────────────────────────────
  memory: {
    create:        "POST   /api/memory/create",
    timeline:      "GET    /api/memory/timeline",
    search:        "GET    /api/memory/search",
    get:           "GET    /api/memory/:memoryId",
    edit:          "PATCH  /api/memory/:memoryId",
    delete:        "DELETE /api/memory/:memoryId",
    pin:           "POST   /api/memory/:memoryId/pin",
    favorite:      "POST   /api/memory/:memoryId/favorite",
    react:         "POST   /api/memory/:memoryId/react",
    comment:       "POST   /api/memory/:memoryId/comment",
  },

  // ── Planner ───────────────────────────────────────────────────────────
  planner: {
    create:        "POST   /api/planner/create",
    list:          "GET    /api/planner/list",
    update:        "PATCH  /api/planner/:planId",
    delete:        "DELETE /api/planner/:planId",
    habitComplete: "POST   /api/planner/:planId/habit-complete",
    checklistToggle:"POST  /api/planner/:planId/checklist-toggle",
  },

  // ── Notifications ─────────────────────────────────────────────────────
  notifications: {
    list:          "GET    /api/notifications",
    markRead:      "PATCH  /api/notifications/:id/read",
    markAllRead:   "POST   /api/notifications/read-all",
    clearRead:     "DELETE /api/notifications/clear-read",
    preferences:   "GET    /api/notifications/preferences",
    updatePrefs:   "PATCH  /api/notifications/preferences",
  },

  // ── AI ────────────────────────────────────────────────────────────────
  ai: {
    insights:      "GET    /api/ai/insights",
    dismiss:       "DELETE /api/ai/insights/:id",
    analyzeText:   "POST   /api/ai/analyze-text",
    suggestions:   "GET    /api/ai/suggestions",
    weeklySummary: "POST   /api/ai/weekly-summary",
  },

  // ── Search ────────────────────────────────────────────────────────────
  search: {
    global:        "GET    /api/search/global",
  },

  // ── Settings ──────────────────────────────────────────────────────────
  settings: {
    getUser:       "GET    /api/settings/user",
    updateUser:    "PATCH  /api/settings/user",
    getRel:        "GET    /api/settings/relationship",
    updateRel:     "PATCH  /api/settings/relationship",
  },

  // ── Privacy ───────────────────────────────────────────────────────────
  privacy: {
    incognito:     "POST   /api/privacy/incognito",
    lockMemory:    "POST   /api/privacy/memories/:id/lock",
    unlockMemory:  "POST   /api/privacy/memories/:id/unlock",
    block:         "POST   /api/privacy/block",
    unblock:       "POST   /api/privacy/unblock",
    export:        "GET    /api/privacy/export",
    sessions:      "GET    /api/privacy/sessions",
    revokeSession: "DELETE /api/privacy/sessions/:id",
    revokeAll:     "DELETE /api/privacy/sessions",
    clearChat:     "POST   /api/privacy/clear-chat",
  },

  // ── Insights ──────────────────────────────────────────────────────────
  insights: {
    list:          "GET    /api/insights",
    latest:        "GET    /api/insights/latest",
    calculate:     "POST   /api/insights/calculate",
  },

  // ── Stories ───────────────────────────────────────────────────────────
  stories: {
    list:          "GET    /api/stories",
    generate:      "POST   /api/stories/generate",
    get:           "GET    /api/stories/:storyId",
    update:        "PATCH  /api/stories/:storyId",
  },

  // ── Journal ───────────────────────────────────────────────────────────
  journal: {
    create:        "POST   /api/journal",
    list:          "GET    /api/journal",
    get:           "GET    /api/journal/:entryId",
    edit:          "PATCH  /api/journal/:entryId",
    delete:        "DELETE /api/journal/:entryId",
    respond:       "POST   /api/journal/:entryId/respond",
    react:         "POST   /api/journal/:entryId/react",
    bookmark:      "POST   /api/journal/:entryId/bookmark",
    toMemory:      "POST   /api/journal/:entryId/convert-to-memory",
  },

  // ── Gifts ─────────────────────────────────────────────────────────────
  gifts: {
    send:          "POST   /api/gifts",
    list:          "GET    /api/gifts",
    open:          "POST   /api/gifts/:giftId/open",
    react:         "POST   /api/gifts/:giftId/react",
    toMemory:      "POST   /api/gifts/:giftId/convert-to-memory",
  },

  // ── Time Capsules ─────────────────────────────────────────────────────
  capsules: {
    create:        "POST   /api/capsules",
    list:          "GET    /api/capsules",
    open:          "POST   /api/capsules/:capsuleId/open",
    unlock:        "POST   /api/capsules/:capsuleId/unlock",
    react:         "POST   /api/capsules/:capsuleId/react",
    toMemory:      "POST   /api/capsules/:capsuleId/convert-to-memory",
    delete:        "DELETE /api/capsules/:capsuleId",
  },

  // ── Sync ──────────────────────────────────────────────────────────────
  sync: {
    batch:         "POST   /api/sync/batch",
  },

  // ── Plugins ───────────────────────────────────────────────────────────
  plugins: {
    list:          "GET    /api/plugins",
    byType:        "GET    /api/plugins/type/:type",
    enable:        "POST   /api/plugins/enable",
    disable:       "POST   /api/plugins/disable",
    config:        "PATCH  /api/plugins/config",
  },

  // ── Health ────────────────────────────────────────────────────────────
  health:          "GET    /health  [public]",
};

export default API_ROUTES;
