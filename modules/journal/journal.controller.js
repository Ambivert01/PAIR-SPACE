import JournalEntry from "./journal.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import Memory from "../memory/memory.model.js";
import { createNotification } from "../notification/notification.service.js";


// Apply visibility rules — can this user see this entry?
const canView = (entry, userId) => {
  if (entry.authorId.toString() === userId) return true; // author always sees own
  switch (entry.visibility) {
    case "private_to_author": return false;
    case "visible_after_response":
      return entry.responses.some((r) => r.authorId.toString() === userId);
    case "visible_after_date":
      return entry.scheduledOpenDate && new Date() >= new Date(entry.scheduledOpenDate);
    default: return true; // shared
  }
};

const populateEntry = (q) =>
  q.populate("authorId", "displayName avatarUrl")
   .populate("responses.authorId", "displayName avatarUrl")
   .populate("attachments", "url thumbnailUrl type mimeType");

// ── Create ─────────────────────────────────────────────────────────────────
export const createEntry = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, type, title, content, emotionTag, visibility, scheduledOpenDate, attachments } = req.body;

  if (!content?.trim()) return res.status(422).json({ error: true, message: "Content required" });

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const entry = await JournalEntry.create({
      relationshipId, authorId: userId, type,
      title: title?.trim() || "",
      content: content.trim(),
      emotionTag: emotionTag || "calm",
      visibility: visibility || "shared",
      scheduledOpenDate: scheduledOpenDate ? new Date(scheduledOpenDate) : null,
      attachments: attachments || [],
    });

    const populated = await populateEntry(JournalEntry.findById(entry._id));

    // notify partner if shared
    if (visibility === "shared" || !visibility) {
      const partnerId = rel.user1Id.toString() === userId ? rel.user2Id.toString() : rel.user1Id.toString();
      createNotification({
        userId: partnerId, relationshipId,
        type: "system_alert",
        title: "New journal entry 📓",
        message: title?.trim() || `A new ${type.replace(/_/g, " ")} was written`,
        priority: "normal",
      });
    }

    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: true, message: "Failed to create entry" });
  }
};

// ── List ───────────────────────────────────────────────────────────────────
export const listEntries = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, type, limit = 20, cursor } = req.query;
  const pageSize = Math.min(Number(limit), 50);

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const query = { relationshipId, deleted: false };
    if (type)   query.type = type;
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    // Fetch with 2× buffer so post-filter visibility never truncates a page.
    // E.g. if half the entries are private, we still return a full page.
    const raw = await populateEntry(
      JournalEntry.find(query).sort({ createdAt: -1 }).limit(pageSize * 2)
    );

    // Apply visibility rules and trim to requested page size
    const visible = raw.filter((e) => canView(e, userId)).slice(0, pageSize);

    // nextCursor comes from the last raw item (not the last visible one),
    // so the next fetch continues from where DB left off.
    const lastRaw    = raw[raw.length - 1];
    const nextCursor = raw.length === pageSize * 2
      ? lastRaw.createdAt.toISOString()
      : null;

    res.json({ entries: visible, nextCursor });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch entries" });
  }
};

// ── Get single ─────────────────────────────────────────────────────────────
export const getEntry = async (req, res) => {
  const userId = req.user.userId;
  try {
    const entry = await populateEntry(JournalEntry.findById(req.params.entryId));
    if (!entry || entry.deleted) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(entry.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    if (!canView(entry, userId))
      return res.status(403).json({ error: true, message: "Entry not yet visible to you" });

    res.json(entry);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch entry" });
  }
};

// ── Edit ───────────────────────────────────────────────────────────────────
export const editEntry = async (req, res) => {
  const userId = req.user.userId;
  const allowed = ["title","content","emotionTag","visibility","scheduledOpenDate"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  try {
    const entry = await JournalEntry.findById(req.params.entryId);
    if (!entry || entry.deleted) return res.status(404).json({ error: true, message: "Not found" });
    if (entry.authorId.toString() !== userId) return res.status(403).json({ error: true, message: "Only author can edit" });

    Object.assign(entry, updates);
    await entry.save();
    const populated = await populateEntry(JournalEntry.findById(entry._id));
    res.json(populated);
  } catch {
    res.status(500).json({ error: true, message: "Failed to edit entry" });
  }
};

// ── Delete (soft) ──────────────────────────────────────────────────────────
export const deleteEntry = async (req, res) => {
  const userId = req.user.userId;
  try {
    const entry = await JournalEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ error: true, message: "Not found" });
    if (entry.authorId.toString() !== userId) return res.status(403).json({ error: true, message: "Only author can delete" });
    entry.deleted = true;
    await entry.save();
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to delete" });
  }
};

// ── Add response ───────────────────────────────────────────────────────────
export const addResponse = async (req, res) => {
  const userId = req.user.userId;
  const { content } = req.body;
  if (!content?.trim()) return res.status(422).json({ error: true, message: "Response content required" });

  try {
    const entry = await JournalEntry.findById(req.params.entryId);
    if (!entry || entry.deleted) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(entry.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    entry.responses.push({ authorId: userId, content: content.trim() });
    await entry.save();

    const populated = await populateEntry(JournalEntry.findById(entry._id));
    res.status(201).json({ responses: populated.responses });
  } catch {
    res.status(500).json({ error: true, message: "Failed to add response" });
  }
};

// ── React ──────────────────────────────────────────────────────────────────
export const reactToEntry = async (req, res) => {
  const userId = req.user.userId;
  const { emoji } = req.body;
  try {
    const entry = await JournalEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(entry.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    entry.reactions = entry.reactions.filter((r) => r.userId.toString() !== userId);
    if (emoji) entry.reactions.push({ userId, emoji });
    await entry.save();
    res.json({ reactions: entry.reactions });
  } catch {
    res.status(500).json({ error: true, message: "Failed to react" });
  }
};

// ── Bookmark ───────────────────────────────────────────────────────────────
export const toggleBookmark = async (req, res) => {
  const userId = req.user.userId;
  try {
    const entry = await JournalEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ error: true, message: "Not found" });

    const idx = entry.bookmarkedBy.findIndex((id) => id.toString() === userId);
    if (idx >= 0) entry.bookmarkedBy.splice(idx, 1);
    else entry.bookmarkedBy.push(userId);
    await entry.save();
    res.json({ bookmarked: idx < 0 });
  } catch {
    res.status(500).json({ error: true, message: "Failed to bookmark" });
  }
};

// ── Convert to memory ──────────────────────────────────────────────────────
export const convertToMemory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const entry = await JournalEntry.findById(req.params.entryId);
    if (!entry || entry.deleted) return res.status(404).json({ error: true, message: "Not found" });
    if (entry.authorId.toString() !== userId) return res.status(403).json({ error: true, message: "Only author can convert" });

    const memory = await Memory.create({
      relationshipId: entry.relationshipId,
      creatorId: userId,
      type: "text_note",
      title: entry.title || `Journal: ${entry.type.replace(/_/g, " ")}`,
      description: entry.content.slice(0, 2000),
      emotionTag: entry.emotionTag || "calm",
      visibility: "visible",
    });

    entry.convertedToMemoryId = memory._id;
    await entry.save();

    res.status(201).json({ memoryId: memory._id });
  } catch {
    res.status(500).json({ error: true, message: "Failed to convert" });
  }
};
