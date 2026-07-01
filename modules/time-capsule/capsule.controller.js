import TimeCapsule from "./capsule.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import Memory from "../memory/memory.model.js";
import { createNotification } from "../notification/notification.service.js";


const getVisibilityState = (capsule) => {
  if (capsule.opened) return "opened";
  const now = new Date();
  const unlock = new Date(capsule.lockedUntil);
  if (now >= unlock) return "ready_to_open";
  const daysLeft = Math.ceil((unlock - now) / 86400000);
  if (daysLeft <= 7) return "countdown_active";
  return "locked";
};

// ── Create capsule ─────────────────────────────────────────────────────────
export const createCapsule = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, capsuleType, title, message, mediaId, openCondition, lockedUntil, afterDays, afterMonths } = req.body;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    let unlockDate;
    if (openCondition === "after_days" && afterDays > 0) {
      unlockDate = new Date(Date.now() + afterDays * 86400000);
    } else if (openCondition === "after_months" && afterMonths > 0) {
      unlockDate = new Date(Date.now() + afterMonths * 30 * 86400000);
    } else if (openCondition === "manual_unlock") {
      unlockDate = new Date(Date.now() + 100 * 365 * 86400000); // far future
    } else if (lockedUntil) {
      unlockDate = new Date(lockedUntil);
    } else {
      return res.status(422).json({ error: true, message: "Unlock date required" });
    }

    if (unlockDate <= new Date())
      return res.status(422).json({ error: true, message: "Unlock date must be in the future" });

    const capsule = await TimeCapsule.create({
      relationshipId, creatorId: userId, capsuleType,
      title: title?.trim() || "",
      message: message?.trim() || "",
      mediaId: mediaId || null,
      openCondition: openCondition || "specific_date",
      lockedUntil: unlockDate,
    });

    res.status(201).json({ ...capsule.toObject(), visibilityState: "locked" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to create capsule" });
  }
};

// ── List capsules ──────────────────────────────────────────────────────────
export const listCapsules = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId } = req.query;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const capsules = await TimeCapsule.find({ relationshipId, deleted: false })
      .sort({ createdAt: -1 })
      .populate("creatorId", "displayName avatarUrl")
      .populate("mediaId", "url thumbnailUrl type mimeType duration");

    const result = capsules.map((c) => {
      const isCreator = c.creatorId._id?.toString() === userId || c.creatorId?.toString() === userId;
      const state = getVisibilityState(c);
      const obj = c.toObject();
      obj.visibilityState = state;

      // hide content from recipient until unlocked
      if (!isCreator && state === "locked") {
        return {
          _id: obj._id, capsuleType: obj.capsuleType, creatorId: obj.creatorId,
          lockedUntil: obj.lockedUntil, openCondition: obj.openCondition,
          createdAt: obj.createdAt, opened: obj.opened, visibilityState: state,
          _hidden: true,
        };
      }
      return obj;
    });

    res.json({ capsules: result });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch capsules" });
  }
};

// ── Open capsule ───────────────────────────────────────────────────────────
export const openCapsule = async (req, res) => {
  const userId = req.user.userId;
  try {
    const capsule = await TimeCapsule.findById(req.params.capsuleId)
      .populate("creatorId", "displayName avatarUrl")
      .populate("mediaId", "url thumbnailUrl type mimeType duration");

    if (!capsule || capsule.deleted) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(capsule.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const isCreator = capsule.creatorId._id?.toString() === userId;
    if (isCreator) return res.status(400).json({ error: true, message: "Cannot open your own capsule" });

    const state = getVisibilityState(capsule);
    if (state === "locked") return res.status(403).json({ error: true, message: "Capsule is still locked" });

    if (!capsule.opened) {
      capsule.opened = true;
      capsule.openedAt = new Date();
      await capsule.save();
    }

    res.json({ ...capsule.toObject(), visibilityState: "opened" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to open capsule" });
  }
};

// ── Manual unlock (creator unlocks early) ─────────────────────────────────
export const manualUnlock = async (req, res) => {
  const userId = req.user.userId;
  try {
    const capsule = await TimeCapsule.findById(req.params.capsuleId);
    if (!capsule) return res.status(404).json({ error: true, message: "Not found" });
    if (capsule.creatorId.toString() !== userId) return res.status(403).json({ error: true, message: "Only creator can unlock" });

    capsule.lockedUntil = new Date(); // unlock now
    await capsule.save();

    // notify partner
    const rel = await Relationship.findById(capsule.relationshipId);
    if (rel) {
      const partnerId = rel.user1Id.toString() === userId ? rel.user2Id.toString() : rel.user1Id.toString();
      createNotification({
        userId: partnerId, relationshipId: capsule.relationshipId,
        type: "system_alert",
        title: "🎙️ A time capsule is ready!",
        message: `${capsule.title || "A capsule"} is now unlocked for you.`,
        priority: "high",
      });
    }

    res.json({ unlocked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to unlock" });
  }
};

// ── React ──────────────────────────────────────────────────────────────────
export const reactToCapsule = async (req, res) => {
  const { emoji } = req.body;
  try {
    const capsule = await TimeCapsule.findByIdAndUpdate(req.params.capsuleId, { reaction: emoji }, { new: true });
    if (!capsule) return res.status(404).json({ error: true, message: "Not found" });
    res.json({ reaction: capsule.reaction });
  } catch {
    res.status(500).json({ error: true, message: "Failed to react" });
  }
};

// ── Convert to memory ──────────────────────────────────────────────────────
export const convertToMemory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const capsule = await TimeCapsule.findById(req.params.capsuleId);
    if (!capsule || !capsule.opened) return res.status(400).json({ error: true, message: "Capsule must be opened first" });

    const rel = await verifyRelationshipMember(capsule.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const memory = await Memory.create({
      relationshipId: capsule.relationshipId,
      creatorId: userId,
      type: "milestone",
      title: capsule.title || `Time Capsule: ${capsule.capsuleType.replace(/_/g, " ")}`,
      description: capsule.message || "",
      emotionTag: "nostalgic",
      visibility: "visible",
    });

    capsule.convertedToMemoryId = memory._id;
    await capsule.save();
    res.status(201).json({ memoryId: memory._id });
  } catch {
    res.status(500).json({ error: true, message: "Failed to convert" });
  }
};

// ── Delete ─────────────────────────────────────────────────────────────────
export const deleteCapsule = async (req, res) => {
  const userId = req.user.userId;
  try {
    const capsule = await TimeCapsule.findById(req.params.capsuleId);
    if (!capsule) return res.status(404).json({ error: true, message: "Not found" });
    if (capsule.creatorId.toString() !== userId) return res.status(403).json({ error: true, message: "Only creator can delete" });
    capsule.deleted = true;
    await capsule.save();
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to delete" });
  }
};

// ── Scheduled unlock check (called by cron) ────────────────────────────────
export const checkScheduledUnlocks = async () => {
  try {
    const due = await TimeCapsule.find({
      lockedUntil: { $lte: new Date() },
      opened: false,
      deleted: false,
    }).populate("creatorId", "displayName");

    for (const capsule of due) {
      const rel = await Relationship.findById(capsule.relationshipId);
      if (!rel || rel.status !== "active") continue;
      const partnerId = rel.user1Id.toString() === capsule.creatorId._id?.toString()
        ? rel.user2Id.toString() : rel.user1Id.toString();
      createNotification({
        userId: partnerId, relationshipId: capsule.relationshipId,
        type: "system_alert",
        title: "🎙️ A time capsule unlocked!",
        message: `${capsule.creatorId.displayName} left you a message from the past.`,
        priority: "high",
      });
    }
  } catch { /* non-critical */ }
};
