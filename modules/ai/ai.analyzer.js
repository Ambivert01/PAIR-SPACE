import Message from "../chat/message.model.js";
import Memory from "../memory/memory.model.js";
import Activity from "../sync/activity.model.js";
import { detectEmotion } from "./ai.emotion.js";

const hoursSince = (date) => (Date.now() - new Date(date)) / 3600000;

export const analyzeRelationship = async (relationshipId, user1Id, user2Id) => {
  const signals = [];
  const now = new Date();
  const oneDayAgo  = new Date(now - 86400000);
  const threeDaysAgo = new Date(now - 3 * 86400000);
  const sevenDaysAgo = new Date(now - 7 * 86400000);

  // ── message frequency ──────────────────────────────────────────────────
  const recentMessages = await Message.find({
    relationshipId,
    type: "text",
    createdAt: { $gte: sevenDaysAgo },
  }).sort({ createdAt: -1 }).limit(100);

  const last24h = recentMessages.filter((m) => m.createdAt >= oneDayAgo);
  const last3d  = recentMessages.filter((m) => m.createdAt >= threeDaysAgo);

  // communication slowdown
  if (recentMessages.length > 0) {
    const lastMsg = recentMessages[0];
    const silenceHours = hoursSince(lastMsg.createdAt);
    if (silenceHours > 24) {
      signals.push({
        type: "communication_slowdown",
        title: "It's been a while 💬",
        description: `No messages in ${Math.floor(silenceHours)} hours.`,
        suggestion: "Send a quick hello — even a small message keeps the connection warm.",
        confidence: 0.85,
      });
    }
  }

  // message imbalance
  if (recentMessages.length >= 10) {
    const u1Count = recentMessages.filter((m) => m.senderId.toString() === user1Id.toString()).length;
    const u2Count = recentMessages.length - u1Count;
    const ratio = Math.max(u1Count, u2Count) / Math.min(u1Count, u2Count || 1);
    if (ratio > 3) {
      signals.push({
        type: "communication_imbalance",
        title: "Conversation feels one-sided",
        description: "One partner is sending significantly more messages.",
        suggestion: "Try asking an open question to invite more sharing.",
        confidence: 0.75,
      });
    }
  }

  // ── memory milestones ──────────────────────────────────────────────────
  const memoryCount = await Memory.countDocuments({ relationshipId, deleted: false });
  const milestones = [10, 25, 50, 100, 200, 500];
  if (milestones.includes(memoryCount)) {
    signals.push({
      type: "milestone_reached",
      title: `🎉 ${memoryCount} memories together!`,
      description: `You've created ${memoryCount} shared memories. That's beautiful.`,
      suggestion: "Consider creating a special memory to celebrate this milestone.",
      confidence: 1.0,
      contextReference: `memory_count_${memoryCount}`,
    });
  }

  // ── activity frequency ─────────────────────────────────────────────────
  const recentActivities = await Activity.countDocuments({
    relationshipId, status: "ended", createdAt: { $gte: sevenDaysAgo },
  });

  if (recentActivities === 0 && recentMessages.length > 5) {
    signals.push({
      type: "activity_suggestion",
      title: "Do something together 🎬",
      description: "You haven't had a shared activity this week.",
      suggestion: "Try a watch-together session or a focus session — it creates shared presence.",
      confidence: 0.7,
    });
  }

  // ── icebreaker if low message count ───────────────────────────────────
  if (last24h.length < 3 && last3d.length > 0) {
    const ICEBREAKERS = [
      "What's one thing that made you smile today?",
      "If we could be anywhere right now, where would you want to be?",
      "What's something you've been thinking about lately?",
      "Tell me one good thing that happened today.",
    ];
    const pick = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    signals.push({
      type: "icebreaker_suggestion",
      title: "Start a conversation 💬",
      description: "Things have been quiet. Here's a conversation starter:",
      suggestion: `"${pick}"`,
      confidence: 0.65,
    });
  }

  // ── gratitude reminder (weekly) ────────────────────────────────────────
  const dayOfWeek = now.getDay();
  if (dayOfWeek === 0) { // Sunday
    signals.push({
      type: "gratitude_reminder",
      title: "Express gratitude 🙏",
      description: "End the week with appreciation.",
      suggestion: "Tell your partner one thing you're grateful for about them this week.",
      confidence: 0.8,
    });
  }

  return signals;
};

// Auto-suggest emotion tag for memory based on description
export const suggestMemoryEmotion = (title, description) => {
  const text = `${title} ${description}`;
  const { emotion } = detectEmotion(text);
  const MEMORY_EMOTION_MAP = {
    happy: "happy", excited: "excited", romantic: "romantic",
    sad: "sad", grateful: "grateful", celebratory: "celebration",
    affectionate: "love", motivational: "motivation", playful: "funny",
    supportive: "supportive", apologetic: "apology",
  };
  return MEMORY_EMOTION_MAP[emotion] || "happy";
};
