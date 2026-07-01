import Message from "./message.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";


export const getMessages = async (req, res) => {
  const { relationshipId } = req.params;
  const rawLimit = Number(req.query.limit) || 30;
  const limit = Math.min(rawLimit, 100);
  const { cursor } = req.query;
  const userId = req.user.userId;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const query = { relationshipId };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const nextCursor =
      messages.length === Number(limit)
        ? messages[messages.length - 1].createdAt.toISOString()
        : null;

    res.json({ messages: messages.reverse(), nextCursor });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch messages" });
  }
};

export const searchMessages = async (req, res) => {
  const { relationshipId } = req.params;
  const { q, from, to, limit = 20 } = req.query;
  const userId = req.user.userId;

  if (!q?.trim())
    return res.status(422).json({ error: true, message: "Search query required" });

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    // Escape special regex characters to prevent ReDoS
    const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = {
      relationshipId,
      deleted: { $ne: true },
      content: { $regex: safe, $options: "i" },
    };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   query.createdAt.$lte = new Date(to);
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ messages });
  } catch {
    res.status(500).json({ error: true, message: "Search failed" });
  }
};
