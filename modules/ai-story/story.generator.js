import Message from "../chat/message.model.js";
import Memory from "../memory/memory.model.js";
import Activity from "../sync/activity.model.js";
import Call from "../call/call.model.js";
import Plan from "../planner/plan.model.js";
import GameSession from "../games/game.model.js";
import Relationship from "../relationship/relationship.model.js";
import Story from "./story.model.js";
import {
  buildMonthlyNarrative, buildMilestoneNarrative,
  buildAnniversaryNarrative, buildJourneyNarrative, buildHighlights,
} from "../../shared/utils/storyBuilder.js";

const MONTH = 30 * 24 * 3600000;

// ── Collect period data ────────────────────────────────────────────────────
const collectData = async (relationshipId, start, end) => {
  const dateFilter = { $gte: start, $lte: end };
  const [messages, memories, activities, calls, plans, games] = await Promise.all([
    Message.countDocuments({ relationshipId, type: "text", deleted: false, createdAt: dateFilter }),
    Memory.find({ relationshipId, deleted: false, createdAt: dateFilter }).select("emotionTag title type"),
    Activity.countDocuments({ relationshipId, status: "ended", createdAt: dateFilter }),
    Call.find({ relationshipId, status: "ended", startedAt: dateFilter }).select("duration"),
    Plan.countDocuments({ relationshipId, deleted: false, createdAt: dateFilter }),
    GameSession.countDocuments({ relationshipId, status: "completed", createdAt: dateFilter }),
  ]);
  const emotionTags = memories.map((m) => m.emotionTag).filter(Boolean);
  return { messages, memories: memories.length, activities, calls, plans, games, emotionTags };
};

// ── Generate monthly story ─────────────────────────────────────────────────
export const generateMonthlyStory = async (relationshipId) => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const data = await collectData(relationshipId, start, end);
  if (data.messages < 5 && data.memories === 0) return null; // insufficient data

  const monthName = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const narrative = buildMonthlyNarrative({ ...data, period: { start, end } });
  const highlights = buildHighlights({ ...data, daysTogether: 30 });

  return Story.create({
    relationshipId,
    storyType: "monthly",
    title: `${monthName} — Your Story`,
    narrative,
    highlights,
    periodStart: start,
    periodEnd: end,
    metadata: { messageCount: data.messages, memoryCount: data.memories },
  });
};

// ── Generate milestone story ───────────────────────────────────────────────
export const generateMilestoneStory = async (relationshipId, milestoneType, value) => {
  const narrative = buildMilestoneNarrative({ milestoneType, value });
  const MILESTONE_TITLES = {
    messages_100:   "100 Messages Together 💬",
    messages_1000:  "1,000 Messages Together 💬",
    memories_10:    "10 Memories Created 📸",
    memories_50:    "50 Memories Created 📸",
    memories_100:   "100 Memories Created 📸",
    first_call:     "Your First Call 📞",
    first_activity: "Your First Shared Activity 🎬",
    first_memory:   "Your First Memory 📸",
    days_30:        "One Month Together 💑",
    days_100:       "100 Days Together 💑",
    days_365:       "One Year Together 🎉",
  };

  return Story.create({
    relationshipId,
    storyType: "milestone",
    title: MILESTONE_TITLES[milestoneType] || `Milestone: ${value}`,
    narrative,
    highlights: [{ icon: "🏁", label: "Milestone", value: String(value) }],
    periodStart: new Date(),
    periodEnd: new Date(),
    metadata: { milestoneType, value },
  });
};

// ── Generate anniversary story ─────────────────────────────────────────────
export const generateAnniversaryStory = async (relationshipId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel) return null;

  const start = rel.createdAt;
  const end   = new Date();
  const years = Math.round((end - start) / (365 * 24 * 3600000));

  const data = await collectData(relationshipId, start, end);
  const narrative = buildAnniversaryNarrative({ years, ...data });
  const highlights = buildHighlights({ ...data, daysTogether: Math.floor((end - start) / 86400000) });

  return Story.create({
    relationshipId,
    storyType: "anniversary",
    title: years === 1 ? "One Year Together 🎉" : `${years} Years Together 🎉`,
    narrative,
    highlights,
    periodStart: start,
    periodEnd: end,
    metadata: { years },
  });
};

// ── Generate full journey story ────────────────────────────────────────────
export const generateJourneyStory = async (relationshipId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel) return null;

  const start = rel.createdAt;
  const end   = new Date();
  const daysTogether = Math.floor((end - start) / 86400000);

  const data = await collectData(relationshipId, start, end);
  if (data.messages < 10) return null;

  const narrative = buildJourneyNarrative({ daysTogether, ...data });
  const highlights = buildHighlights({ ...data, daysTogether });

  return Story.create({
    relationshipId,
    storyType: "journey",
    title: "Your Relationship Journey 💑",
    narrative,
    highlights,
    periodStart: start,
    periodEnd: end,
    metadata: { daysTogether },
  });
};

// ── Check and trigger milestone stories ───────────────────────────────────
export const checkMilestones = async (relationshipId) => {
  const [msgCount, memCount, rel] = await Promise.all([
    Message.countDocuments({ relationshipId, type: "text", deleted: false }),
    Memory.countDocuments({ relationshipId, deleted: false }),
    Relationship.findById(relationshipId),
  ]);

  const daysTogether = rel ? Math.floor((Date.now() - new Date(rel.createdAt)) / 86400000) : 0;

  const milestones = [
    { type: "messages_100",  check: msgCount === 100 },
    { type: "messages_1000", check: msgCount === 1000 },
    { type: "memories_10",   check: memCount === 10 },
    { type: "memories_50",   check: memCount === 50 },
    { type: "memories_100",  check: memCount === 100 },
    { type: "days_30",       check: daysTogether === 30 },
    { type: "days_100",      check: daysTogether === 100 },
    { type: "days_365",      check: daysTogether === 365 },
  ];

  for (const { type, check } of milestones) {
    if (!check) continue;
    // avoid duplicate milestone stories
    const exists = await Story.findOne({ relationshipId, storyType: "milestone", "metadata.milestoneType": type });
    if (!exists) {
      await generateMilestoneStory(relationshipId, type, type.replace(/_/g, " ")).catch(() => {});
    }
  }
};
