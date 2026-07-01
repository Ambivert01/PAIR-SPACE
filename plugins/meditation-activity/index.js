/**
 * Shared Meditation Session Plugin
 * Adds a guided meditation activity type to the Activities Hub.
 * Demonstrates: activity_plugin interface
 */

let config = {};

const plugin = {
  name:        "meditation-activity",
  version:     "1.0.0",
  type:        "activity_plugin",
  description: "Adds a shared guided meditation session activity",
  author:      "PairSpace",

  // activity_plugin required fields
  activityType: "meditation_session",
  label:        "Meditate Together",
  emoji:        "🧘",

  configSchema: {
    defaultDuration: { type: "number", default: 10, label: "Default duration (minutes)" },
    guidedAudio:     { type: "boolean", default: false, label: "Enable guided audio" },
  },

  initialize: async (cfg = {}) => {
    config = { defaultDuration: 10, guidedAudio: false, ...cfg };
    console.log(`[meditation-activity] initialized with duration=${config.defaultDuration}m`);
  },

  execute: async ({ relationshipId, userId }) => {
    return {
      activityType: "meditation_session",
      metadata: {
        title:    `${config.defaultDuration}-minute meditation`,
        duration: config.defaultDuration * 60,
      },
    };
  },

  cleanup: () => {
    config = {};
    console.log("[meditation-activity] cleaned up");
  },

  // UI descriptor for frontend
  ui: {
    description: "Breathe together, even from a distance.",
    color:       "from-teal-900/60 to-green-900/60",
  },
};

export default plugin;
