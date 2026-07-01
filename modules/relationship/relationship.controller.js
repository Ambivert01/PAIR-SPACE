import { validationResult } from "express-validator";
import Relationship from "./relationship.model.js";
import User from "../auth/user.model.js";
import { createSystemMemory } from "../memory/memory.controller.js";
import { createRelationshipSettingsDefault } from "../settings/settings.controller.js";
import Message from "../chat/message.model.js";
import Memory from "../memory/memory.model.js";

const validationError = (res, errors) =>
  res.status(422).json({ error: true, message: errors.array()[0].msg });

const formatRelationship = async (rel, userId) => {
  const partnerId = rel.user1Id.toString() === userId ? rel.user2Id : rel.user1Id;
  const partner   = await User.findById(partnerId).select("displayName avatarUrl");

  // unread message count
  const unreadCount = await Message.countDocuments({
    relationshipId: rel._id,
    senderId: { $ne: userId },
    status: { $in: ["sent", "delivered"] },
    deleted: false,
  }).catch(() => 0);

  return {
    id:                 rel._id,
    status:             rel.status,
    relationshipType:   rel.relationshipType,
    nickname:           rel.nickname,
    anniversaryDate:    rel.anniversaryDate,
    pinned:             rel.pinned,
    mutedNotifications: rel.mutedNotifications,
    settings:           rel.settings,
    createdAt:          rel.createdAt,
    updatedAt:          rel.updatedAt,
    unreadCount,
    partner: partner
      ? { id: partnerId, displayName: partner.displayName, avatarUrl: partner.avatarUrl }
      : null,
  };
};

// ── List all relationships for user ───────────────────────────────────────
export const listMyRelationships = async (req, res) => {
  const userId = req.user.userId;
  const { includeArchived = false } = req.query;

  try {
    const statusFilter = includeArchived
      ? { $in: ["pending", "active", "blocked", "archived"] }
      : { $in: ["pending", "active", "blocked"] };

    const rels = await Relationship.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: statusFilter,
    }).sort({ pinned: -1, updatedAt: -1 });

    const formatted = await Promise.all(rels.map((r) => formatRelationship(r, userId)));
    res.json({ relationships: formatted });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch relationships" });
  }
};

// ── Get single relationship by ID ─────────────────────────────────────────
export const getRelationshipById = async (req, res) => {
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(req.params.relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
    res.json(await formatRelationship(rel, userId));
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch relationship" });
  }
};

// ── Send invite — no longer blocks if user has other relationships ─────────
export const sendInvite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);

  const { email, relationshipType = "couple" } = req.body;
  const inviterId = req.user.userId;

  try {
    const target = await User.findOne({ email });
    if (!target)
      return res.status(404).json({ error: true, message: "No user found with that email" });

    if (target._id.toString() === inviterId)
      return res.status(400).json({ error: true, message: "You cannot invite yourself" });

    // prevent duplicate pending invite to same person
    const duplicate = await Relationship.findOne({
      $or: [
        { user1Id: inviterId, user2Id: target._id },
        { user1Id: target._id, user2Id: inviterId },
      ],
      status: { $in: ["pending", "active"] },
    });
    if (duplicate)
      return res.status(409).json({ error: true, message: "You already have an active or pending space with this person" });

    const rel = await Relationship.create({
      user1Id: inviterId,
      user2Id: target._id,
      relationshipType,
    });

    res.status(201).json(await formatRelationship(rel, inviterId));
  } catch {
    res.status(500).json({ error: true, message: "Failed to send invite" });
  }
};

// ── Accept invite ──────────────────────────────────────────────────────────
export const acceptInvite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);

  const { relationshipId } = req.body;
  const userId = req.user.userId;

  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || rel.user2Id.toString() !== userId)
      return res.status(403).json({ error: true, message: "Invite not found or not yours to accept" });
    if (rel.status !== "pending")
      return res.status(400).json({ error: true, message: "Invite is no longer pending" });

    rel.status = "active";
    await rel.save();

    createSystemMemory({ relationshipId: rel._id, title: "Your space began ✨", description: "This is where your story starts.", emotionTag: "celebration" });
    createRelationshipSettingsDefault(rel._id);

    res.json(await formatRelationship(rel, userId));
  } catch {
    res.status(500).json({ error: true, message: "Failed to accept invite" });
  }
};

// ── Reject invite ──────────────────────────────────────────────────────────
export const rejectInvite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);
  const { relationshipId } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || rel.user2Id.toString() !== userId)
      return res.status(403).json({ error: true, message: "Invite not found or not yours to reject" });
    if (rel.status !== "pending")
      return res.status(400).json({ error: true, message: "Invite is no longer pending" });
    rel.status = "rejected";
    await rel.save();
    res.json({ message: "Invite rejected" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to reject invite" });
  }
};

// ── Cancel invite ──────────────────────────────────────────────────────────
export const cancelInvite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);
  const { relationshipId } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || rel.user1Id.toString() !== userId)
      return res.status(403).json({ error: true, message: "Invite not found or not yours to cancel" });
    if (rel.status !== "pending")
      return res.status(400).json({ error: true, message: "Only pending invites can be cancelled" });
    rel.status = "cancelled";
    await rel.save();
    res.json({ message: "Invite cancelled" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to cancel invite" });
  }
};

// ── Get my relationship (legacy — returns first active, for backward compat) ─
export const getMyRelationship = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId } = req.query;

  try {
    let rel;
    if (relationshipId) {
      rel = await Relationship.findById(relationshipId);
      const isMember = rel && (rel.user1Id.toString() === userId || rel.user2Id.toString() === userId);
      if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
    } else {
      rel = await Relationship.findOne({
        $or: [{ user1Id: userId }, { user2Id: userId }],
        status: { $in: ["pending", "active", "blocked"] },
      }).sort({ pinned: -1, updatedAt: -1 });
    }

    if (!rel) return res.status(404).json({ error: true, message: "No active relationship found" });
    res.json(await formatRelationship(rel, userId));
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch relationship" });
  }
};

// ── End relationship ───────────────────────────────────────────────────────
export const endRelationship = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);
  const { relationshipId } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Not your relationship" });
    if (rel.status !== "active") return res.status(400).json({ error: true, message: "Only active relationships can be ended" });
    rel.status = "ended";
    await rel.save();
    res.json({ message: "Relationship ended. Data retained." });
  } catch {
    res.status(500).json({ error: true, message: "Failed to end relationship" });
  }
};

// ── Rename (nickname) ──────────────────────────────────────────────────────
export const renameRelationship = async (req, res) => {
  const { relationshipId, nickname } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
    rel.nickname = (nickname || "").slice(0, 60);
    await rel.save();
    res.json({ nickname: rel.nickname });
  } catch {
    res.status(500).json({ error: true, message: "Failed to rename" });
  }
};

// ── Archive / unarchive ────────────────────────────────────────────────────
export const archiveRelationship = async (req, res) => {
  const { relationshipId, archive = true } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
    rel.status = archive ? "archived" : "active";
    await rel.save();
    res.json({ archived: archive });
  } catch {
    res.status(500).json({ error: true, message: "Failed to archive" });
  }
};

// ── Pin / unpin ────────────────────────────────────────────────────────────
export const pinRelationship = async (req, res) => {
  const { relationshipId } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
    rel.pinned = !rel.pinned;
    await rel.save();
    res.json({ pinned: rel.pinned });
  } catch {
    res.status(500).json({ error: true, message: "Failed to pin" });
  }
};

// ── Mute / unmute notifications ────────────────────────────────────────────
export const muteRelationship = async (req, res) => {
  const { relationshipId, mute } = req.body;
  const userId = req.user.userId;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });
    rel.mutedNotifications = !!mute;
    await rel.save();
    res.json({ muted: rel.mutedNotifications });
  } catch {
    res.status(500).json({ error: true, message: "Failed to mute" });
  }
};

// ── Relationship stats (for dashboard counts) ──────────────────────────────
export const getRelationshipStats = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId } = req.params;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });

    const [messageCount, memoryCount] = await Promise.all([
      Message.countDocuments({ relationshipId, deleted: { $ne: true } }),
      Memory.countDocuments({ relationshipId, deleted: false }),
    ]);

    const daysTogether = rel.startDate
      ? Math.floor((Date.now() - new Date(rel.startDate)) / 86400000)
      : 0;

    res.json({ messageCount, memoryCount, daysTogether });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch stats" });
  }
};
