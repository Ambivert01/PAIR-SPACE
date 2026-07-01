import Memory from "./memory.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import Media from "../media/media.model.js";
import { createNotification } from "../notification/notification.service.js";
import { checkMilestones } from "../ai-story/story.generator.js";
import { processMemoryEvent } from "../ai/ai.processor.js";

// ── helpers ────────────────────────────────────────────────────────────────

const populateMemory = (q) =>
  q.populate("mediaIds", "url thumbnailUrl type mimeType duration")
   .populate("creatorId", "displayName avatarUrl")
   .populate("comments.userId", "displayName avatarUrl");

// ── create ─────────────────────────────────────────────────────────────────
export const createMemory = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, type, title, description, emotionTag,
          mediaIds = [], location, tags = [], visibility, memoryDate } = req.body;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const memory = await Memory.create({
      relationshipId, creatorId: userId, type,
      title: title?.trim() || "",
      description: description?.trim() || "",
      emotionTag: emotionTag || "happy",
      mediaIds, location, tags,
      visibility: visibility || "visible",
      memoryDate: memoryDate ? new Date(memoryDate) : new Date(),
    });

    const populated = await populateMemory(Memory.findById(memory._id));

    // notify partner
    const partnerId = rel.user1Id.toString() === userId ? rel.user2Id.toString() : rel.user1Id.toString();
    createNotification({
      userId: partnerId, relationshipId,
      type: "memory_created",
      title: "New memory added ✨",
      message: memory.title || `A new ${memory.type.replace(/_/g, " ")} was added`,
      entityType: "memory", entityId: memory._id,
      priority: "normal",
    });
    // milestone check + AI processing (async, non-blocking)
    checkMilestones(relationshipId).catch(() => {});
    processMemoryEvent(relationshipId, memory.title, memory.description).catch(() => {});

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: true, message: "Failed to create memory" });
  }
};

// ── timeline ───────────────────────────────────────────────────────────────
export const getTimeline = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, cursor, emotion, type, pinned, sort = "chronological" } = req.query;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const query = { relationshipId, deleted: false, visibility: { $ne: "hidden" } };
    if (cursor)  query.memoryDate = { $lt: new Date(cursor) };
    if (emotion) query.emotionTag = emotion;
    if (type)    query.type = type;
    if (pinned === "true") query.pinned = true;

    const sortOpt = sort === "emotion" ? { emotionTag: 1, memoryDate: -1 } : { pinned: -1, memoryDate: -1 };

    const memories = await populateMemory(
      Memory.find(query).sort(sortOpt).limit(Number(limit))
    );

    const nextCursor = memories.length === Number(limit)
      ? memories[memories.length - 1].memoryDate.toISOString()
      : null;

    res.json({ memories, nextCursor });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch timeline" });
  }
};

// ── single ─────────────────────────────────────────────────────────────────
export const getMemory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const memory = await populateMemory(Memory.findById(req.params.memoryId));
    if (!memory || memory.deleted) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    res.json(memory);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch memory" });
  }
};

// ── edit ───────────────────────────────────────────────────────────────────
export const editMemory = async (req, res) => {
  const userId = req.user.userId;
  const allowed = ["title", "description", "emotionTag", "tags", "location", "visibility", "memoryDate", "mediaIds"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  try {
    const memory = await Memory.findById(req.params.memoryId);
    if (!memory || memory.deleted) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    Object.assign(memory, updates);
    await memory.save();

    const populated = await populateMemory(Memory.findById(memory._id));
    res.json(populated);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update memory" });
  }
};

// ── delete (soft) ──────────────────────────────────────────────────────────
export const deleteMemory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const memory = await Memory.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    memory.deleted = true;
    await memory.save();
    res.json({ message: "Memory deleted" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to delete memory" });
  }
};

// ── pin toggle ─────────────────────────────────────────────────────────────
export const togglePin = async (req, res) => {
  const userId = req.user.userId;
  try {
    const memory = await Memory.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    memory.pinned = !memory.pinned;
    await memory.save();
    res.json({ pinned: memory.pinned });
  } catch {
    res.status(500).json({ error: true, message: "Failed to pin memory" });
  }
};

// ── favorite toggle ────────────────────────────────────────────────────────
export const toggleFavorite = async (req, res) => {
  const userId = req.user.userId;
  try {
    const memory = await Memory.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const idx = memory.favoritedBy.findIndex((id) => id.toString() === userId);
    if (idx === -1) memory.favoritedBy.push(userId);
    else memory.favoritedBy.splice(idx, 1);

    await memory.save();
    res.json({ favorited: idx === -1 });
  } catch {
    res.status(500).json({ error: true, message: "Failed to update favorite" });
  }
};

// ── react ──────────────────────────────────────────────────────────────────
export const reactToMemory = async (req, res) => {
  const userId = req.user.userId;
  const { emoji } = req.body;
  try {
    const memory = await Memory.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    memory.reactions = memory.reactions.filter((r) => r.userId.toString() !== userId);
    if (emoji) memory.reactions.push({ userId, emoji });
    await memory.save();

    res.json({ reactions: memory.reactions });
  } catch {
    res.status(500).json({ error: true, message: "Failed to react" });
  }
};

// ── comment ────────────────────────────────────────────────────────────────
export const addComment = async (req, res) => {
  const userId = req.user.userId;
  const { text } = req.body;
  if (!text?.trim()) return res.status(422).json({ error: true, message: "Comment text required" });

  try {
    const memory = await Memory.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(memory.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    memory.comments.push({ userId, text: text.trim() });
    await memory.save();

    const populated = await populateMemory(Memory.findById(memory._id));
    res.status(201).json({ comments: populated.comments });
  } catch {
    res.status(500).json({ error: true, message: "Failed to add comment" });
  }
};

// ── search ─────────────────────────────────────────────────────────────────
export const searchMemories = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, q } = req.query;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  if (!q?.trim()) return res.status(422).json({ error: true, message: "Query required" });

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    // Escape special regex characters to prevent ReDoS
    const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = { $regex: safe, $options: "i" };
    const memories = await populateMemory(
      Memory.find({
        relationshipId, deleted: false,
        $or: [{ title: regex }, { description: regex }, { tags: regex }],
      }).sort({ memoryDate: -1 }).limit(Number(limit))
    );

    res.json({ memories });
  } catch {
    res.status(500).json({ error: true, message: "Search failed" });
  }
};

// ── system memory helper (used by other modules) ───────────────────────────
export const createSystemMemory = async ({ relationshipId, title, description, emotionTag = "celebration" }) => {
  try {
    await Memory.create({
      relationshipId,
      creatorId: null,
      type: "system_generated",
      title, description, emotionTag,
      visibility: "visible",
    });
  } catch { /* non-critical */ }
};
