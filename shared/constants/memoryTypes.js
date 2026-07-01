export const MEMORY_TYPES = [
  "photo", "video", "voice_note", "text_note", "milestone",
  "anniversary", "letter", "location_visit", "achievement",
  "gratitude_note", "apology_note", "promise", "goal_created",
  "goal_completed", "first_time_event", "custom_event", "system_generated",
];

export const EMOTION_TAGS = [
  "happy", "romantic", "funny", "proud", "excited", "calm",
  "grateful", "nostalgic", "supportive", "celebration", "emotional",
  "sad", "apology", "motivation", "love", "custom",
];

export const MEMORY_VISIBILITY = ["visible", "hidden", "private_note", "locked"];

export const EMOTION_META = {
  happy:       { emoji: "😊", color: "text-yellow-400" },
  romantic:    { emoji: "❤️",  color: "text-red-400"    },
  funny:       { emoji: "😂", color: "text-yellow-300" },
  proud:       { emoji: "🏆", color: "text-amber-400"  },
  excited:     { emoji: "🎉", color: "text-pink-400"   },
  calm:        { emoji: "🌿", color: "text-green-400"  },
  grateful:    { emoji: "🙏", color: "text-indigo-400" },
  nostalgic:   { emoji: "🌅", color: "text-orange-400" },
  supportive:  { emoji: "🤝", color: "text-blue-400"   },
  celebration: { emoji: "🎊", color: "text-pink-300"   },
  emotional:   { emoji: "💧", color: "text-blue-300"   },
  sad:         { emoji: "😢", color: "text-gray-400"   },
  apology:     { emoji: "💙", color: "text-blue-500"   },
  motivation:  { emoji: "🔥", color: "text-orange-500" },
  love:        { emoji: "💕", color: "text-rose-400"   },
  custom:      { emoji: "✨", color: "text-purple-400" },
};

export const MEMORY_TYPE_META = {
  photo:           { emoji: "📷", label: "Photo"          },
  video:           { emoji: "🎥", label: "Video"          },
  voice_note:      { emoji: "🎙️", label: "Voice Note"     },
  text_note:       { emoji: "📝", label: "Note"           },
  milestone:       { emoji: "🏁", label: "Milestone"      },
  anniversary:     { emoji: "💍", label: "Anniversary"    },
  letter:          { emoji: "💌", label: "Letter"         },
  location_visit:  { emoji: "📍", label: "Place"          },
  achievement:     { emoji: "🌟", label: "Achievement"    },
  gratitude_note:  { emoji: "🙏", label: "Gratitude"      },
  apology_note:    { emoji: "💙", label: "Apology"        },
  promise:         { emoji: "🤞", label: "Promise"        },
  goal_created:    { emoji: "🎯", label: "Goal"           },
  goal_completed:  { emoji: "✅", label: "Goal Completed" },
  first_time_event:{ emoji: "🌱", label: "First Time"     },
  custom_event:    { emoji: "💫", label: "Custom"         },
  system_generated:{ emoji: "⚡", label: "Milestone"      },
};
