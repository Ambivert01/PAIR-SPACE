import Message from "../chat/message.model.js";
import Memory from "../memory/memory.model.js";
import Activity from "../sync/activity.model.js";
import Plan from "../planner/plan.model.js";
import Call from "../call/call.model.js";
import GameSession from "../games/game.model.js";
import RelationshipInsight from "./insight.model.js";
import {
  calcMessageFrequency, calcConversationBalance, calcResponsePattern,
  calcPositivityTrend, estimateSharedTime, calcTrend, buildDailyBuckets, scoreToText,
} from "../../shared/utils/insightCalculations.js";

const WEEK = 7 * 24 * 3600000;

export const calculateInsights = async (relationshipId, user1Id, user2Id, period = "weekly") => {
  const now      = new Date();
  const weekAgo  = new Date(now - WEEK);
  const twoWeeksAgo = new Date(now - 2 * WEEK);

  const insights = [];

  // ── Messages ───────────────────────────────────────────────────────────
  const [thisWeekMsgs, lastWeekMsgs] = await Promise.all([
    Message.find({ relationshipId, type: "text", deleted: false, createdAt: { $gte: weekAgo } }).sort({ createdAt: 1 }),
    Message.find({ relationshipId, type: "text", deleted: false, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
  ]);

  // communication frequency
  const freq = calcMessageFrequency(thisWeekMsgs, 7);
  const freqTrend = calcTrend(thisWeekMsgs.length, lastWeekMsgs.length);
  insights.push({
    insightType: "communication_frequency",
    title: `${freq.label} communication this week`,
    description: `${thisWeekMsgs.length} messages exchanged. ${freqTrend === "up" ? "More than last week 📈" : freqTrend === "down" ? "Less than last week" : "Similar to last week."}`,
    score: freq.score,
    trend: freqTrend,
    metadata: { count: thisWeekMsgs.length, perDay: (thisWeekMsgs.length / 7).toFixed(1), dailyBuckets: buildDailyBuckets(thisWeekMsgs) },
  });

  // conversation balance
  const u1Count = thisWeekMsgs.filter((m) => m.senderId.toString() === user1Id.toString()).length;
  const u2Count = thisWeekMsgs.length - u1Count;
  const balance = calcConversationBalance(u1Count, u2Count);
  insights.push({
    insightType: "conversation_balance",
    title: `Conversation is ${balance.label.toLowerCase()}`,
    description: balance.ratio <= 0.6 ? "Both of you are contributing equally to conversations." : "One partner is sending more messages. Try to invite more sharing.",
    score: balance.score,
    trend: "neutral",
    metadata: { user1Count: u1Count, user2Count: u2Count, ratio: balance.ratio },
  });

  // response time
  const responseData = calcResponsePattern(thisWeekMsgs);
  insights.push({
    insightType: "response_time_pattern",
    title: `${responseData.label} response times`,
    description: responseData.avgMinutes
      ? `Average response time: ${responseData.avgMinutes < 60 ? `${Math.round(responseData.avgMinutes)}m` : `${(responseData.avgMinutes / 60).toFixed(1)}h`}`
      : "Not enough data yet.",
    score: responseData.score,
    trend: "neutral",
    metadata: { avgMinutes: responseData.avgMinutes },
  });

  // ── Memories ───────────────────────────────────────────────────────────
  const [thisWeekMems, lastWeekMems] = await Promise.all([
    Memory.countDocuments({ relationshipId, deleted: false, createdAt: { $gte: weekAgo } }),
    Memory.countDocuments({ relationshipId, deleted: false, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
  ]);
  const totalMems = await Memory.countDocuments({ relationshipId, deleted: false });
  const memTrend = calcTrend(thisWeekMems, lastWeekMems);
  insights.push({
    insightType: "memory_creation_frequency",
    title: thisWeekMems > 0 ? `${thisWeekMems} memor${thisWeekMems === 1 ? "y" : "ies"} created this week` : "No new memories this week",
    description: `${totalMems} total memories in your timeline. ${memTrend === "up" ? "Memory creation is growing 📸" : ""}`,
    score: Math.min(100, thisWeekMems * 20),
    trend: memTrend,
    metadata: { thisWeek: thisWeekMems, lastWeek: lastWeekMems, total: totalMems },
  });

  // ── Activities ─────────────────────────────────────────────────────────
  const [thisWeekActs, lastWeekActs] = await Promise.all([
    Activity.countDocuments({ relationshipId, status: "ended", createdAt: { $gte: weekAgo } }),
    Activity.countDocuments({ relationshipId, status: "ended", createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
  ]);
  const actTrend = calcTrend(thisWeekActs, lastWeekActs);
  insights.push({
    insightType: "shared_activity_frequency",
    title: thisWeekActs > 0 ? `${thisWeekActs} shared activit${thisWeekActs === 1 ? "y" : "ies"} this week` : "No shared activities this week",
    description: thisWeekActs > 0 ? `You spent time together beyond just chatting. ${actTrend === "up" ? "More than last week! 🎬" : ""}` : "Try a watch-together or focus session this week.",
    score: Math.min(100, thisWeekActs * 25),
    trend: actTrend,
    metadata: { thisWeek: thisWeekActs, lastWeek: lastWeekActs },
  });

  // ── Calls ──────────────────────────────────────────────────────────────
  const calls = await Call.find({ relationshipId, status: "ended", startedAt: { $gte: weekAgo } });
  const totalCallSecs = calls.reduce((a, c) => a + (c.duration || 0), 0);
  const callMins = Math.round(totalCallSecs / 60);
  insights.push({
    insightType: "call_frequency",
    title: calls.length > 0 ? `${calls.length} call${calls.length > 1 ? "s" : ""} this week` : "No calls this week",
    description: callMins > 0 ? `${callMins} minutes of voice/video time together.` : "Consider scheduling a call this week.",
    score: Math.min(100, calls.length * 30),
    trend: "neutral",
    metadata: { count: calls.length, totalMinutes: callMins },
  });

  // ── Positivity trend ───────────────────────────────────────────────────
  const recentMems = await Memory.find({ relationshipId, deleted: false, createdAt: { $gte: weekAgo } }).select("emotionTag");
  const emotionTags = recentMems.map((m) => m.emotionTag).filter(Boolean);
  const positivity = calcPositivityTrend(emotionTags);
  insights.push({
    insightType: "positivity_trend",
    title: `${positivity.label} emotional tone`,
    description: positivity.positiveRatio >= 0.6
      ? "Your shared memories reflect a positive emotional space. 💕"
      : "Your emotional space has mixed signals — that's normal.",
    score: positivity.score,
    trend: positivity.score >= 60 ? "up" : "neutral",
    metadata: { positiveRatio: positivity.positiveRatio, emotionTags },
  });

  // ── Shared time estimation ─────────────────────────────────────────────
  const chatBursts = Math.floor(thisWeekMsgs.length / 10);
  const sharedMins = estimateSharedTime({
    callDurationSecs: totalCallSecs,
    activityCount: thisWeekActs,
    chatBursts,
    focusSessions: 0,
  });
  insights.push({
    insightType: "shared_time_estimation",
    title: `~${sharedMins} minutes together this week`,
    description: sharedMins >= 120
      ? "You're investing meaningful time in your relationship. 💑"
      : "Even small moments of connection add up.",
    score: Math.min(100, sharedMins / 3),
    trend: "neutral",
    metadata: { estimatedMinutes: sharedMins, callMins, activityMins: thisWeekActs * 30, chatMins: chatBursts * 5 },
  });

  // ── Planner alignment ──────────────────────────────────────────────────
  const completedPlans = await Plan.countDocuments({ relationshipId, status: "completed", updatedAt: { $gte: weekAgo } });
  const totalPlans = await Plan.countDocuments({ relationshipId, deleted: false, status: { $ne: "cancelled" } });
  insights.push({
    insightType: "planner_alignment",
    title: completedPlans > 0 ? `${completedPlans} plan${completedPlans > 1 ? "s" : ""} completed this week` : "No plans completed this week",
    description: totalPlans > 0 ? `${totalPlans} total plans in your shared space.` : "Start planning together to stay aligned.",
    score: Math.min(100, completedPlans * 30),
    trend: "neutral",
    metadata: { completed: completedPlans, total: totalPlans },
  });

  // ── Games ──────────────────────────────────────────────────────────────
  const games = await GameSession.countDocuments({ relationshipId, status: "completed", createdAt: { $gte: weekAgo } });
  if (games > 0) {
    insights.push({
      insightType: "engagement_trend",
      title: `${games} game${games > 1 ? "s" : ""} played this week`,
      description: "Playful interactions strengthen emotional bonds. 🎮",
      score: Math.min(100, games * 25),
      trend: "up",
      metadata: { gamesPlayed: games },
    });
  }

  // save all insights
  const periodStart = weekAgo;
  const periodEnd   = now;
  await RelationshipInsight.insertMany(
    insights.map((ins) => ({ relationshipId, period, periodStart, periodEnd, ...ins }))
  );

  return insights;
};
