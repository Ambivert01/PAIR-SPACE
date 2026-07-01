export const CAPSULE_TYPES = [
  { value: "voice_letter",       label: "Voice Letter",       emoji: "🎙️", desc: "Record your voice" },
  { value: "video_letter",       label: "Video Letter",       emoji: "🎥", desc: "Record a video message" },
  { value: "text_letter",        label: "Text Letter",        emoji: "💌", desc: "Write a heartfelt message" },
  { value: "memory_capsule",     label: "Memory Capsule",     emoji: "📸", desc: "Preserve a moment" },
  { value: "encouragement_capsule",label:"Encouragement",     emoji: "💪", desc: "Send future strength" },
  { value: "birthday_capsule",   label: "Birthday Capsule",   emoji: "🎂", desc: "For their birthday" },
  { value: "anniversary_capsule",label: "Anniversary",        emoji: "💍", desc: "For your anniversary" },
  { value: "motivation_capsule", label: "Motivation",         emoji: "🌟", desc: "Inspire future self" },
  { value: "support_capsule",    label: "Support Capsule",    emoji: "🤗", desc: "Open when feeling low" },
  { value: "custom_capsule",     label: "Custom",             emoji: "✨", desc: "Your own creation" },
];

export const OPEN_CONDITIONS = [
  { value: "specific_date",  label: "On a specific date",    emoji: "📅" },
  { value: "after_days",     label: "After N days",          emoji: "⏳" },
  { value: "after_months",   label: "After N months",        emoji: "🗓️" },
  { value: "manual_unlock",  label: "I'll unlock it manually",emoji: "🔑" },
];

export const CAPSULE_VISIBILITY = {
  locked:           { label: "Locked",          emoji: "🔒", color: "text-gray-500" },
  countdown_active: { label: "Counting down",   emoji: "⏳", color: "text-yellow-400" },
  ready_to_open:    { label: "Ready to open!",  emoji: "🎁", color: "text-green-400" },
  opened:           { label: "Opened",          emoji: "💌", color: "text-indigo-400" },
};
