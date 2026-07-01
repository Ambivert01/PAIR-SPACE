export const THEMES = [
  {
    value: "soft_romantic",
    label: "Soft Romantic",
    emoji: "🌸",
    vars: {
      "--bg": "#1a0f1e",
      "--surface": "#2d1b3d",
      "--border": "#4d3566",
      "--text": "#faf5ff",
    },
  },
  {
    value: "minimal_calm",
    label: "Minimal Calm",
    emoji: "🌿",
    vars: {
      "--bg": "#0f1117",
      "--surface": "#1a1d27",
      "--border": "#2a2d3a",
      "--text": "#e8eaf0",
    },
  },
  {
    value: "modern_clean",
    label: "Modern Clean",
    emoji: "⚡",
    vars: {
      "--bg": "#0a0a0f",
      "--surface": "#141420",
      "--border": "#252535",
      "--text": "#f0f0ff",
    },
  },
  {
    value: "warm_cozy",
    label: "Warm Cozy",
    emoji: "🕯️",
    vars: {
      "--bg": "#1e0f0a",
      "--surface": "#2d1b15",
      "--border": "#4a2f1f",
      "--text": "#fff5e6",
    },
  },
  {
    value: "dark_intimate",
    label: "Dark Intimate",
    emoji: "🌙",
    vars: {
      "--bg": "#1a0f1e",
      "--surface": "#2d1b3d",
      "--border": "#3d2952",
      "--text": "#faf5ff",
    },
  },
  {
    value: "pastel_light",
    label: "Pastel Light",
    emoji: "☁️",
    vars: {
      "--bg": "#faf5ff",
      "--surface": "#ffffff",
      "--border": "#e9d5ff",
      "--text": "#2d1b3d",
    },
  },
  {
    value: "nature_inspired",
    label: "Nature Inspired",
    emoji: "🌲",
    vars: {
      "--bg": "#0a0f0d",
      "--surface": "#15201a",
      "--border": "#1f3528",
      "--text": "#e6fff0",
    },
  },
  { value: "custom", label: "Custom", emoji: "✨", vars: {} },
];

export const VISUAL_MOODS = [
  { value: "calm", label: "Calm", emoji: "🌿", opacity: 0.3 },
  { value: "warm", label: "Warm", emoji: "🕯️", opacity: 0.4 },
  { value: "playful", label: "Playful", emoji: "🎉", opacity: 0.5 },
  { value: "dreamy", label: "Dreamy", emoji: "🌙", opacity: 0.35 },
  { value: "serious", label: "Serious", emoji: "💼", opacity: 0.2 },
  { value: "energetic", label: "Energetic", emoji: "⚡", opacity: 0.6 },
  { value: "neutral", label: "Neutral", emoji: "⚪", opacity: 0.25 },
];

export const FONT_STYLES = [
  { value: "default", label: "Default", family: "inherit" },
  { value: "rounded", label: "Rounded", family: "'Nunito', sans-serif" },
  { value: "elegant", label: "Elegant", family: "'Playfair Display', serif" },
  { value: "minimal", label: "Minimal", family: "'Inter', sans-serif" },
  { value: "handwritten", label: "Handwritten", family: "'Caveat', cursive" },
];

export const CHAT_BUBBLE_STYLES = [
  { value: "rounded", label: "Rounded", radius: "1.25rem" },
  { value: "soft", label: "Soft", radius: "1.5rem" },
  { value: "modern", label: "Modern", radius: "0.75rem" },
  { value: "minimal", label: "Minimal", radius: "0.375rem" },
];

export const MEMORY_LAYOUTS = [
  { value: "card_grid", label: "Card Grid", emoji: "⊞" },
  { value: "classic_timeline", label: "Timeline", emoji: "📜" },
  { value: "scrapbook", label: "Scrapbook", emoji: "📔" },
  { value: "minimal_list", label: "Minimal List", emoji: "≡" },
  { value: "highlight", label: "Highlights", emoji: "⭐" },
];

export const SOUND_THEMES = [
  { value: "none", label: "Silent", emoji: "🔇" },
  { value: "minimal", label: "Minimal", emoji: "🔈" },
  { value: "soft_chime", label: "Soft Chime", emoji: "🔔" },
];

export const ACCENT_COLORS = [
  { value: "rose", label: "Rose", hex: "#f43f5e" },
  { value: "indigo", label: "Indigo", hex: "#6366f1" },
  { value: "purple", label: "Purple", hex: "#a855f7" },
  { value: "amber", label: "Amber", hex: "#f59e0b" },
  { value: "teal", label: "Teal", hex: "#14b8a6" },
  { value: "pink", label: "Pink", hex: "#ec4899" },
];

export const PERSONALIZATION_DEFAULTS = {
  relationshipName: "",
  theme: "dark_intimate",
  accentColor: "indigo",
  fontStyle: "default",
  animationLevel: "normal",
  sharedWallpaper: "",
  backgroundStyle: "solid",
  chatBubbleStyle: "rounded",
  memoryCardStyle: "card_grid",
  emojiStyle: "default",
  soundTheme: "none",
  visualMood: "calm",
  anniversaryTheme: "default",
};
