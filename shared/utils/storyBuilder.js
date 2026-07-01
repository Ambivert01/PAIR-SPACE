// Pure narrative builder — template-based, warm and personal tone
// No external AI calls — runs locally, full privacy

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Opening phrases ────────────────────────────────────────────────────────
const OPENINGS = {
  monthly: [
    "This month, your shared space came alive with",
    "Looking back at this month, it was filled with",
    "This month brought",
    "A beautiful month passed — marked by",
  ],
  milestone: [
    "A meaningful milestone was reached —",
    "Something worth celebrating happened:",
    "Your journey together reached a new chapter:",
    "A moment to remember:",
  ],
  anniversary: [
    "One year of building something beautiful together.",
    "A full year has passed since your space began.",
    "Twelve months of shared moments, memories, and growth.",
    "Your first year together — a story worth telling.",
  ],
  journey: [
    "From the very beginning, your connection has been",
    "Your relationship story started with",
    "The journey you've built together is one of",
  ],
};

// ── Communication descriptors ──────────────────────────────────────────────
const commDesc = (count, days) => {
  const perDay = count / days;
  if (perDay >= 20) return "vibrant, constant conversation";
  if (perDay >= 10) return "active and engaged communication";
  if (perDay >= 5)  return "steady, meaningful exchanges";
  if (perDay >= 1)  return "thoughtful, intentional messages";
  return "quiet but present connection";
};

// ── Emotion descriptors ────────────────────────────────────────────────────
const emotionDesc = (tags = []) => {
  const counts = {};
  for (const t of tags) counts[t] = (counts[t] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
  if (!top.length) return "warm and genuine";
  const map = {
    happy: "joyful", romantic: "deeply romantic", grateful: "grateful and appreciative",
    excited: "excited and energetic", supportive: "supportive and caring",
    nostalgic: "nostalgic and reflective", love: "full of love",
    calm: "calm and peaceful", celebratory: "celebratory",
  };
  return top.map((t) => map[t] || t).join(" and ");
};

// ── Build monthly story narrative ──────────────────────────────────────────
export const buildMonthlyNarrative = ({ messages, memories, activities, calls, plans, emotionTags, period }) => {
  const days = Math.round((new Date(period.end) - new Date(period.start)) / 86400000) || 30;
  const callMins = Math.round(calls.reduce((a, c) => a + (c.duration || 0), 0) / 60);
  const opening = pick(OPENINGS.monthly);
  const emotion = emotionDesc(emotionTags);

  let narrative = `${opening} ${commDesc(messages, days)}. `;

  if (messages > 0) narrative += `You exchanged ${messages} messages, keeping your connection alive every day. `;
  if (memories > 0) narrative += `Together you created ${memories} ${memories === 1 ? "memory" : "memories"} — moments worth keeping forever. `;
  if (activities > 0) narrative += `You shared ${activities} ${activities === 1 ? "activity" : "activities"} together, from watching movies to focus sessions. `;
  if (callMins > 0) narrative += `Your voices connected for ${callMins} minutes across ${calls.length} ${calls.length === 1 ? "call" : "calls"}. `;
  if (plans > 0) narrative += `You planned ${plans} things together, showing care for your shared future. `;

  narrative += `The emotional tone of your space this month was ${emotion}. `;
  narrative += pick([
    "Every message, every memory — they all add up to something beautiful.",
    "Small moments, consistently shared, build something extraordinary.",
    "This is what connection looks like.",
    "Your story continues to grow.",
  ]);

  return narrative.trim();
};

// ── Build milestone narrative ──────────────────────────────────────────────
export const buildMilestoneNarrative = ({ milestoneType, value, context = {} }) => {
  const templates = {
    messages_100:   `You've now shared 100 messages together. Every word has been a thread in the fabric of your connection.`,
    messages_1000:  `A thousand messages exchanged. That's a thousand moments of reaching out, of being present for each other.`,
    memories_10:    `Ten memories created together. Your timeline is beginning to tell a beautiful story.`,
    memories_50:    `Fifty shared memories. Half a hundred moments you chose to preserve together.`,
    memories_100:   `One hundred memories. Your shared archive is a testament to how much you've experienced together.`,
    first_call:     `Your first call together — the moment your voices connected across the distance.`,
    first_activity: `Your first shared activity — the beginning of doing things together, not just talking about them.`,
    first_memory:   `Your very first memory was created. The story of your space officially began.`,
    days_30:        `One month together in this space. Thirty days of building something that belongs only to you two.`,
    days_100:       `One hundred days. A hundred mornings, evenings, and everything in between — shared.`,
    days_365:       `A full year. 365 days of choosing each other, every single day.`,
  };
  return templates[milestoneType] || `A meaningful milestone: ${value}. Your journey continues to grow.`;
};

// ── Build anniversary narrative ────────────────────────────────────────────
export const buildAnniversaryNarrative = ({ years, messages, memories, activities, emotionTags }) => {
  const emotion = emotionDesc(emotionTags);
  const opening = pick(OPENINGS.anniversary);

  let narrative = `${opening} `;
  if (years > 1) narrative += `${years} years of shared moments, and your connection only deepens. `;
  narrative += `Over this time, you've exchanged ${messages} messages, created ${memories} memories, and shared ${activities} activities together. `;
  narrative += `The emotional signature of your relationship has been ${emotion}. `;
  narrative += pick([
    "Here's to everything you've built — and everything still ahead.",
    "Your story is one worth telling, and it's still being written.",
    "The best chapters are always the ones you haven't read yet.",
    "Thank you for choosing this space, and each other.",
  ]);

  return narrative.trim();
};

// ── Build journey story (full relationship arc) ────────────────────────────
export const buildJourneyNarrative = ({ daysTogether, messages, memories, activities, calls, emotionTags }) => {
  const emotion = emotionDesc(emotionTags);
  const callMins = Math.round(calls.reduce((a, c) => a + (c.duration || 0), 0) / 60);
  const opening = pick(OPENINGS.journey);

  let narrative = `${opening} ${emotion}. `;
  narrative += `Over ${daysTogether} days, you've built a shared world that belongs entirely to you two. `;
  narrative += `${messages} messages have been exchanged — each one a small act of presence. `;
  if (memories > 0) narrative += `${memories} memories have been preserved in your timeline. `;
  if (activities > 0) narrative += `You've shared ${activities} activities together, creating moments beyond words. `;
  if (callMins > 0) narrative += `Your voices have connected for ${callMins} minutes. `;
  narrative += pick([
    "This is your story. It's still being written.",
    "Every day you choose this space is another page in something beautiful.",
    "What you've built here is rare. Cherish it.",
  ]);

  return narrative.trim();
};

// ── Generate highlights array ──────────────────────────────────────────────
export const buildHighlights = ({ messages, memories, activities, calls, plans, games, daysTogether }) => {
  const highlights = [];
  if (messages > 0)     highlights.push({ icon: "💬", label: "Messages",   value: messages.toString() });
  if (memories > 0)     highlights.push({ icon: "📸", label: "Memories",   value: memories.toString() });
  if (activities > 0)   highlights.push({ icon: "🎬", label: "Activities", value: activities.toString() });
  if (calls.length > 0) {
    const mins = Math.round(calls.reduce((a, c) => a + (c.duration || 0), 0) / 60);
    highlights.push({ icon: "📞", label: "Call time", value: `${mins}m` });
  }
  if (plans > 0)        highlights.push({ icon: "📅", label: "Plans",      value: plans.toString() });
  if (games > 0)        highlights.push({ icon: "🎮", label: "Games",      value: games.toString() });
  if (daysTogether > 0) highlights.push({ icon: "💑", label: "Days together", value: daysTogether.toString() });
  return highlights;
};
