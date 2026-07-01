export const JOURNAL_ENTRY_TYPES = [
  { value: "daily_entry",         label: "Daily Entry",         emoji: "📓" },
  { value: "gratitude_entry",     label: "Gratitude",           emoji: "🙏" },
  { value: "reflection_entry",    label: "Reflection",          emoji: "🌊" },
  { value: "letter_entry",        label: "Letter",              emoji: "💌" },
  { value: "future_letter",       label: "Future Letter",       emoji: "🔮" },
  { value: "goal_reflection",     label: "Goal Reflection",     emoji: "🎯" },
  { value: "emotion_reflection",  label: "Emotion Reflection",  emoji: "💙" },
  { value: "milestone_reflection",label: "Milestone Reflection",emoji: "🏁" },
  { value: "custom_entry",        label: "Custom",              emoji: "✨" },
];

export const JOURNAL_PROMPTS = {
  daily_entry: [
    "Describe your day in a few sentences.",
    "What was the best moment of today?",
    "What challenged you today, and how did you handle it?",
    "What's one thing you want to remember about today?",
    "How are you feeling right now, honestly?",
  ],
  gratitude_entry: [
    "What made you smile today?",
    "What are you most grateful for right now?",
    "What did your partner do that helped or touched you?",
    "Name three small things that brought you joy this week.",
    "What's something you often take for granted but appreciate deeply?",
  ],
  reflection_entry: [
    "What have you been thinking about lately?",
    "What's something you've learned about yourself recently?",
    "How have you grown in the past month?",
    "What would you tell your past self from a year ago?",
    "What does your ideal life look like right now?",
  ],
  letter_entry: [
    "Write a letter to your partner about how you feel today.",
    "Tell your partner something you've been meaning to say.",
    "Write about a moment that meant a lot to you.",
    "Express something you appreciate but rarely say out loud.",
    "Write about a dream or hope you have for your relationship.",
  ],
  future_letter: [
    "Write to your future self — what do you hope has changed?",
    "Write to your partner to be opened on a special date.",
    "What do you hope your relationship looks like in one year?",
    "Write a letter to be opened on your anniversary.",
    "What promises do you want to make to yourself today?",
  ],
  goal_reflection: [
    "What goal are you working toward right now?",
    "What progress have you made this week?",
    "What's holding you back, and how can you move past it?",
    "How can your partner support your goals?",
    "What does success look like for you in this area?",
  ],
  emotion_reflection: [
    "What emotion has been most present for you lately?",
    "What triggered a strong feeling recently, and why?",
    "How do you want to feel, and what would help you get there?",
    "What's something you've been avoiding feeling?",
    "How has your emotional state affected your relationship?",
  ],
  milestone_reflection: [
    "What milestone are you celebrating or reflecting on?",
    "How did you get here, and what did it take?",
    "Who helped you reach this point?",
    "What does this milestone mean to you?",
    "What's the next chapter from here?",
  ],
  custom_entry: [
    "Write whatever is on your mind.",
    "Start with: 'Right now I feel...'",
    "Start with: 'Something I want you to know is...'",
    "Start with: 'Today I realized...'",
    "Start with: 'I'm grateful for...'",
  ],
};

export const JOURNAL_VISIBILITY = [
  { value: "shared",                label: "Shared",                desc: "Partner can read immediately" },
  { value: "private_to_author",     label: "Private",               desc: "Only you can read this" },
  { value: "visible_after_response",label: "After response",        desc: "Partner sees after they respond" },
  { value: "visible_after_date",    label: "On scheduled date",     desc: "Opens on a future date" },
];
