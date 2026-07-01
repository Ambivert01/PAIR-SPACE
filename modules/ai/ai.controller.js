import AIInsight from "./ai.insight.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import { detectEmotion } from "./ai.emotion.js";
import { generateWeeklySummary } from "./ai.processor.js";


export const getInsights = async (req, res) => {
  const { relationshipId, limit = 10 } = req.query;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const insights = await AIInsight.find({
      relationshipId, dismissed: false,
    }).sort({ createdAt: -1 }).limit(Number(limit));

    res.json({ insights });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch insights" });
  }
};

export const dismissInsight = async (req, res) => {
  try {
    await AIInsight.findByIdAndUpdate(req.params.id, { dismissed: true, read: true });
    res.json({ message: "Dismissed" });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const markInsightRead = async (req, res) => {
  try {
    await AIInsight.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked read" });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const analyzeText = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(422).json({ error: true, message: "Text required" });
  const result = detectEmotion(text);
  res.json(result);
};

export const getConversationSuggestions = async (req, res) => {
  const { relationshipId } = req.query;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const suggestions = [
      { type: "appreciation",  text: "Tell me one thing you appreciate about me today 💕" },
      { type: "icebreaker",    text: "What's something small that made you happy today?" },
      { type: "deep",          text: "What's been on your mind lately that you haven't told me?" },
      { type: "fun",           text: "If we could do anything together right now, what would it be?" },
      { type: "gratitude",     text: "I'm grateful for you because..." },
      { type: "check_in",      text: "How are you really feeling today?" },
      { type: "memory",        text: "What's your favorite memory of us so far?" },
      { type: "future",        text: "What's something you're looking forward to?" },
    ];

    // shuffle and return 3
    const shuffled = suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
    res.json({ suggestions: shuffled });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const triggerWeeklySummary = async (req, res) => {
  const { relationshipId } = req.body;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });
    await generateWeeklySummary(relationshipId);
    res.json({ message: "Summary generated" });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};
