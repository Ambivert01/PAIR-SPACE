// ── Communication frequency ────────────────────────────────────────────────
export const calcMessageFrequency = (messages, days = 7) => {
  const perDay = messages.length / days;
  if (perDay >= 20) return { score: 95, label: "Very active", trend: "up" };
  if (perDay >= 10) return { score: 80, label: "Active",      trend: "up" };
  if (perDay >= 5)  return { score: 60, label: "Steady",      trend: "neutral" };
  if (perDay >= 1)  return { score: 40, label: "Light",       trend: "neutral" };
  return              { score: 15, label: "Quiet",       trend: "down" };
};

// ── Conversation balance ───────────────────────────────────────────────────
export const calcConversationBalance = (user1Count, user2Count) => {
  const total = user1Count + user2Count;
  if (total === 0) return { score: 50, label: "No data", ratio: 0.5 };
  const ratio = Math.max(user1Count, user2Count) / total;
  if (ratio <= 0.55) return { score: 95, label: "Well balanced",    ratio };
  if (ratio <= 0.65) return { score: 75, label: "Mostly balanced",  ratio };
  if (ratio <= 0.75) return { score: 55, label: "Slightly one-sided", ratio };
  return               { score: 30, label: "One-sided",           ratio };
};

// ── Response time pattern ──────────────────────────────────────────────────
export const calcResponsePattern = (messages) => {
  if (messages.length < 4) return { score: 50, label: "Insufficient data", avgMinutes: null };
  const gaps = [];
  for (let i = 1; i < messages.length; i++) {
    const diff = (new Date(messages[i].createdAt) - new Date(messages[i-1].createdAt)) / 60000;
    if (diff > 0 && diff < 1440) gaps.push(diff); // ignore gaps > 24h
  }
  if (!gaps.length) return { score: 50, label: "Insufficient data", avgMinutes: null };
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  if (avg <= 5)   return { score: 95, label: "Very responsive",  avgMinutes: avg };
  if (avg <= 15)  return { score: 80, label: "Responsive",       avgMinutes: avg };
  if (avg <= 60)  return { score: 60, label: "Moderate",         avgMinutes: avg };
  if (avg <= 240) return { score: 40, label: "Slow",             avgMinutes: avg };
  return            { score: 20, label: "Very slow",         avgMinutes: avg };
};

// ── Positivity trend ───────────────────────────────────────────────────────
const POSITIVE_EMOTIONS = new Set(["happy","excited","romantic","grateful","supportive","affectionate","celebratory","playful","motivational","love"]);
const NEGATIVE_EMOTIONS = new Set(["sad","angry","frustrated","anxious","lonely","apologetic"]);

export const calcPositivityTrend = (emotionTags = []) => {
  if (!emotionTags.length) return { score: 50, label: "No data", positiveRatio: 0.5 };
  const pos = emotionTags.filter((e) => POSITIVE_EMOTIONS.has(e)).length;
  const neg = emotionTags.filter((e) => NEGATIVE_EMOTIONS.has(e)).length;
  const ratio = pos / (pos + neg || 1);
  if (ratio >= 0.8) return { score: 90, label: "Very positive",    positiveRatio: ratio };
  if (ratio >= 0.6) return { score: 70, label: "Mostly positive",  positiveRatio: ratio };
  if (ratio >= 0.4) return { score: 50, label: "Mixed",            positiveRatio: ratio };
  return              { score: 30, label: "Needs attention",   positiveRatio: ratio };
};

// ── Shared time estimation (minutes) ──────────────────────────────────────
export const estimateSharedTime = ({ callDurationSecs = 0, activityCount = 0, chatBursts = 0, focusSessions = 0 }) => {
  const callMins     = callDurationSecs / 60;
  const activityMins = activityCount * 30;    // avg 30 min per activity
  const chatMins     = chatBursts * 5;         // avg 5 min per burst
  const focusMins    = focusSessions * 25;     // avg 25 min pomodoro
  return Math.round(callMins + activityMins + chatMins + focusMins);
};

// ── Score to descriptive text ──────────────────────────────────────────────
export const scoreToText = (score) => {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 55) return "good";
  if (score >= 40) return "moderate";
  if (score >= 25) return "light";
  return "minimal";
};

// ── Trend indicator ────────────────────────────────────────────────────────
export const calcTrend = (current, previous) => {
  if (previous === 0) return "neutral";
  const change = (current - previous) / previous;
  if (change > 0.1)  return "up";
  if (change < -0.1) return "down";
  return "neutral";
};

// ── Build daily message buckets for graph ─────────────────────────────────
export const buildDailyBuckets = (messages, days = 7) => {
  const buckets = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    buckets[key] = 0;
  }
  for (const msg of messages) {
    const key = new Date(msg.createdAt).toLocaleDateString("en-US", { weekday: "short" });
    if (key in buckets) buckets[key]++;
  }
  return Object.entries(buckets).map(([day, count]) => ({ day, count }));
};
