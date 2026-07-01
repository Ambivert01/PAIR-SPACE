import Relationship from "../relationship/relationship.model.js";
import AIInsight from "./ai.insight.model.js";
import { analyzeRelationship } from "./ai.analyzer.js";
import { detectEmotion, detectStress } from "./ai.emotion.js";
import Message from "../chat/message.model.js";

// per-relationship debounce — only process once per 30s burst
const debounceMap = new Map();
const DEBOUNCE_MS = 30_000;

const isDebounced = (relationshipId) => {
  const key = relationshipId.toString();
  const last = debounceMap.get(key);
  if (last && Date.now() - last < DEBOUNCE_MS) return true;
  debounceMap.set(key, Date.now());
  return false;
};

// Deduplicate — don't create same insight type within 6 hours
const shouldCreate = async (relationshipId, type, contextRef = "") => {
  const sixHoursAgo = new Date(Date.now() - 6 * 3600000);
  const existing = await AIInsight.findOne({
    relationshipId, type,
    ...(contextRef ? { contextReference: contextRef } : {}),
    createdAt: { $gte: sixHoursAgo },
    dismissed: false,
  });
  return !existing;
};

// Process after a message is sent — async, never awaited by caller
export const processMessageEvent = async (relationshipId, senderId, messageContent) => {
  if (isDebounced(relationshipId)) return; // skip burst processing
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || rel.status !== "active") return;

    // 1. emotion detection on message
    const { emotion, confidence } = detectEmotion(messageContent);

    // 2. stress detection from recent messages
    const recentMsgs = await Message.find({
      relationshipId, type: "text",
      createdAt: { $gte: new Date(Date.now() - 3 * 3600000) },
    }).limit(15);

    const stressed = detectStress(recentMsgs);
    if (stressed && await shouldCreate(relationshipId, "partner_stressed")) {
      await AIInsight.create({
        relationshipId,
        type: "partner_stressed",
        title: "Your partner may be stressed 💙",
        description: "Recent messages suggest some emotional tension.",
        suggestion: "A warm, supportive message can make a big difference right now.",
        confidence: 0.72,
      });
    }

    // 3. run full relationship analysis (throttled — only every 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
    const recentInsight = await AIInsight.findOne({
      relationshipId, createdAt: { $gte: twoHoursAgo },
    });

    if (!recentInsight) {
      const signals = await analyzeRelationship(
        relationshipId,
        rel.user1Id,
        rel.user2Id
      );

      for (const signal of signals) {
        if (await shouldCreate(relationshipId, signal.type, signal.contextReference || "")) {
          await AIInsight.create({ relationshipId, ...signal });
        }
      }
    }
  } catch (err) {
    // AI errors must never surface to users
  }
};

// Process after memory created — suggest emotion tag
export const processMemoryEvent = async (relationshipId, title, description) => {
  try {
    const { emotion, confidence } = detectEmotion(`${title} ${description}`);
    if (confidence > 0.6 && await shouldCreate(relationshipId, "memory_highlight")) {
      await AIInsight.create({
        relationshipId,
        type: "memory_highlight",
        title: "Memory emotion detected ✨",
        description: `This memory feels ${emotion}.`,
        suggestion: `Consider tagging this memory as "${emotion}" to find it easily later.`,
        confidence,
      });
    }
  } catch { /* silent */ }
};

// Weekly summary — called by scheduler or manually
export const generateWeeklySummary = async (relationshipId) => {
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return;

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const [msgCount, memCount, actCount] = await Promise.all([
      Message.countDocuments({ relationshipId, type: "text", createdAt: { $gte: sevenDaysAgo } }),
      (await import("../memory/memory.model.js")).default.countDocuments({ relationshipId, deleted: false, createdAt: { $gte: sevenDaysAgo } }),
      (await import("../sync/activity.model.js")).default.countDocuments({ relationshipId, status: "ended", createdAt: { $gte: sevenDaysAgo } }),
    ]);

    const parts = [];
    if (msgCount > 0)  parts.push(`${msgCount} messages`);
    if (memCount > 0)  parts.push(`${memCount} memories`);
    if (actCount > 0)  parts.push(`${actCount} activities`);

    if (parts.length === 0) return;

    if (await shouldCreate(relationshipId, "weekly_summary")) {
      await AIInsight.create({
        relationshipId,
        type: "weekly_summary",
        title: "Your week together 📊",
        description: `This week: ${parts.join(", ")}.`,
        suggestion: msgCount > 20
          ? "Great communication this week! Keep it up."
          : "Try to connect a little more next week.",
        confidence: 0.9,
      });
    }
  } catch { /* silent */ }
};
