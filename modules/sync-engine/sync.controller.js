import Relationship from "../relationship/relationship.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Message from "../chat/message.model.js";
import Memory from "../memory/memory.model.js";
import Plan from "../planner/plan.model.js";
import { UserSettings } from "../settings/settings.model.js";


// ── Action handlers ────────────────────────────────────────────────────────
const handlers = {
  async message_send(payload, userId, relationshipId) {
    const { content, type = "text", replyToMessageId, mediaUrl, thumbnailUrl, metadata } = payload;
    if (!content?.trim() && type === "text") throw new Error("Empty message");
    const msg = await Message.create({
      relationshipId, senderId: userId, type,
      content: content?.trim() || "",
      status: "sent",
      ...(replyToMessageId && { replyToMessageId }),
      ...(mediaUrl && { mediaUrl }),
      ...(thumbnailUrl && { thumbnailUrl }),
      ...(metadata && { metadata }),
    });
    return { messageId: msg._id, status: "sent" };
  },

  async message_edit(payload, userId) {
    const { messageId, content } = payload;
    const msg = await Message.findById(messageId);
    if (!msg || msg.senderId.toString() !== userId) throw new Error("Not authorized");
    msg.content = content.trim();
    msg.edited = true;
    await msg.save();
    return { messageId, edited: true };
  },

  async message_delete(payload, userId) {
    const { messageId } = payload;
    const msg = await Message.findById(messageId);
    if (!msg || msg.senderId.toString() !== userId) throw new Error("Not authorized");
    msg.deleted = true; msg.content = "";
    await msg.save();
    return { messageId, deleted: true };
  },

  async memory_create(payload, userId, relationshipId) {
    const { type, title, description, emotionTag, tags, memoryDate, location } = payload;
    const mem = await Memory.create({
      relationshipId, creatorId: userId, type,
      title: title?.trim() || "", description: description?.trim() || "",
      emotionTag: emotionTag || "happy", tags: tags || [],
      memoryDate: memoryDate ? new Date(memoryDate) : new Date(),
      ...(location && { location }),
    });
    return { memoryId: mem._id };
  },

  async memory_update(payload, userId) {
    const { memoryId, ...updates } = payload;
    const allowed = ["title","description","emotionTag","tags","location","visibility","memoryDate"];
    const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    const mem = await Memory.findByIdAndUpdate(memoryId, filtered, { new: true });
    return { memoryId: mem?._id };
  },

  async planner_create(payload, userId, relationshipId) {
    const rel = await Relationship.findById(relationshipId);
    const plan = await Plan.create({
      relationshipId, createdBy: userId,
      participants: rel ? [rel.user1Id, rel.user2Id] : [userId],
      ...payload,
    });
    return { planId: plan._id };
  },

  async planner_update(payload, userId) {
    const { planId, ...updates } = payload;
    const allowed = ["title","description","status","progress","dueDate","tags"];
    const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    await Plan.findByIdAndUpdate(planId, filtered);
    return { planId };
  },

  async settings_update(payload, userId) {
    const allowed = ["appearance","notifications","privacy","ai","chat","calls","data"];
    const dotUpdates = {};
    for (const section of allowed) {
      if (payload[section]) {
        for (const [k, v] of Object.entries(payload[section])) {
          dotUpdates[`${section}.${k}`] = v;
        }
      }
    }
    await UserSettings.findOneAndUpdate({ userId }, { $set: dotUpdates }, { upsert: true });
    return { updated: true };
  },
};

// ── Batch endpoint ─────────────────────────────────────────────────────────
export const processBatch = async (req, res) => {
  const userId  = req.user.userId;
  const actions = req.body.actions;

  if (!Array.isArray(actions) || actions.length === 0)
    return res.status(422).json({ error: true, message: "No actions provided" });

  if (actions.length > 50)
    return res.status(422).json({ error: true, message: "Max 50 actions per batch" });

  const results = [];

  for (const action of actions) {
    const { id, actionType, payload = {}, relationshipId } = action;
    try {
      const ok = await verifyRelationshipMember(relationshipId, userId);
      if (!ok) { results.push({ id, status: "failed", error: "Access denied" }); continue; }

      const handler = handlers[actionType];
      if (!handler) { results.push({ id, status: "failed", error: `Unknown action: ${actionType}` }); continue; }

      const data = await handler(payload, userId, relationshipId);
      results.push({ id, status: "synced", data });
    } catch (err) {
      results.push({ id, status: "failed", error: err.message });
    }
  }

  res.json({ results });
};
