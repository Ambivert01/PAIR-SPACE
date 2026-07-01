import Relationship from "../relationship/relationship.model.js";
import Message from "../chat/message.model.js";
import Memory from "../memory/memory.model.js";
import Plan from "../planner/plan.model.js";
import Activity from "../sync/activity.model.js";
import Media from "../media/media.model.js";
import GameSession from "../games/game.model.js";
import { buildRegex, sanitizeQuery, isTagSearch, extractTag } from "../../shared/utils/searchHelpers.js";

const LIMIT = 20;


export const globalSearch = async (req, res) => {
  const { q, type, dateFrom, dateTo, limit = LIMIT } = req.query;
  const userId = req.user.userId;

  if (!q?.trim() || q.trim().length < 2)
    return res.status(422).json({ error: true, message: "Query must be at least 2 characters" });

  try {
    // find user's active relationship
    const rel = await Relationship.findOne({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: "active",
    });
    if (!rel) return res.status(404).json({ error: true, message: "No active relationship" });

    const relationshipId = rel._id;
    const lim = Math.min(Number(limit), LIMIT);
    const isTag = isTagSearch(q.trim());
    const tag   = isTag ? extractTag(q.trim()) : null;
    const regex = buildRegex(isTag ? tag : q.trim());

    // date range filter
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo)   dateFilter.$lte = new Date(dateTo);
    const hasDate = Object.keys(dateFilter).length > 0;

    const results = { messages: [], memories: [], plans: [], activities: [], files: [], games: [] };

    const run = async (key, fn) => {
      if (!type || type === key) {
        try { results[key] = await fn(); } catch { results[key] = []; }
      }
    };

    await Promise.all([
      run("messages", () => {
        if (isTag) return [];
        const q2 = { relationshipId, deleted: false, type: "text", content: regex };
        if (hasDate) q2.createdAt = dateFilter;
        return Message.find(q2).sort({ createdAt: -1 }).limit(lim)
          .select("content senderId createdAt type");
      }),

      run("memories", () => {
        const q2 = { relationshipId, deleted: false };
        if (isTag) q2.tags = { $regex: sanitizeQuery(tag), $options: "i" };
        else q2.$or = [{ title: regex }, { description: regex }, { tags: regex }];
        if (hasDate) q2.memoryDate = dateFilter;
        return Memory.find(q2).sort({ memoryDate: -1 }).limit(lim)
          .select("title description emotionTag type memoryDate tags");
      }),

      run("plans", () => {
        const q2 = { relationshipId, deleted: false };
        if (isTag) q2.tags = { $regex: sanitizeQuery(tag), $options: "i" };
        else q2.$or = [{ title: regex }, { description: regex }, { tags: regex }];
        if (hasDate) q2.dueDate = dateFilter;
        return Plan.find(q2).sort({ createdAt: -1 }).limit(lim)
          .select("title description type status priority dueDate tags");
      }),

      run("activities", () => {
        if (isTag) return [];
        const q2 = { relationshipId };
        if (regex) q2["metadata.title"] = regex;
        if (hasDate) q2.createdAt = dateFilter;
        return Activity.find(q2).sort({ createdAt: -1 }).limit(lim)
          .select("activityType metadata status createdAt");
      }),

      run("files", () => {
        if (isTag) return [];
        const q2 = { relationshipId, deleted: false };
        q2.$or = [{ originalName: regex }, { fileName: regex }];
        if (hasDate) q2.createdAt = dateFilter;
        return Media.find(q2).sort({ createdAt: -1 }).limit(lim)
          .select("originalName fileName type mimeType url thumbnailUrl size createdAt");
      }),

      run("games", () => {
        if (isTag) return [];
        const q2 = { relationshipId, status: "completed" };
        if (regex) q2.gameType = regex;
        if (hasDate) q2.createdAt = dateFilter;
        return GameSession.find(q2).sort({ createdAt: -1 }).limit(lim)
          .select("gameType status result createdAt");
      }),
    ]);

    const total = Object.values(results).reduce((a, b) => a + b.length, 0);
    res.json({ results, total, query: q.trim() });
  } catch (err) {
    res.status(500).json({ error: true, message: "Search failed" });
  }
};
