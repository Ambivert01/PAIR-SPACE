import Relationship from "../relationship/relationship.model.js";
import Memory from "../memory/memory.model.js";
import Message from "../chat/message.model.js";
import Plan from "../planner/plan.model.js";
import Session from "./session.model.js";
import { UserSettings } from "../settings/settings.model.js";
import { hashPin, verifyPin, validateMembership } from "../../shared/utils/securityHelpers.js";

// ── Incognito mode ─────────────────────────────────────────────────────────
export const setIncognito = async (req, res) => {
  const { enabled } = req.body;
  try {
    await UserSettings.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { "privacy.showOnlineStatus": !enabled, "privacy.showActivityStatus": !enabled } },
      { upsert: true }
    );
    res.json({ incognito: !!enabled });
  } catch {
    res.status(500).json({ error: true, message: "Failed to update incognito mode" });
  }
};

// ── Lock memory with PIN ───────────────────────────────────────────────────
export const lockMemory = async (req, res) => {
  const { memoryId } = req.params;
  const { pin } = req.body;
  if (!pin || String(pin).length < 4)
    return res.status(422).json({ error: true, message: "PIN must be at least 4 digits" });

  try {
    const memory = await Memory.findById(memoryId);
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await Relationship.findById(memory.relationshipId);
    if (!validateMembership(rel, req.user.userId))
      return res.status(403).json({ error: true, message: "Access denied" });

    const pinHash = await hashPin(pin);
    memory.visibility = "locked";
    memory.set("lockPin", pinHash);
    memory.set("lockedAt", new Date());
    await memory.save();

    res.json({ locked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to lock memory" });
  }
};

export const unlockMemory = async (req, res) => {
  const { memoryId } = req.params;
  const { pin } = req.body;

  try {
    // lockPin has `select: false` in the schema (so it never leaks through
    // normal memory reads) — must explicitly request it here to verify it.
    const memory = await Memory.findById(memoryId).select("+lockPin");
    if (!memory) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await Relationship.findById(memory.relationshipId);
    if (!validateMembership(rel, req.user.userId))
      return res.status(403).json({ error: true, message: "Access denied" });

    const storedPin = memory.get("lockPin");
    if (!storedPin) return res.status(400).json({ error: true, message: "Memory is not locked" });

    const valid = await verifyPin(pin, storedPin);
    if (!valid) return res.status(401).json({ error: true, message: "Incorrect PIN" });

    memory.visibility = "visible";
    memory.set("lockPin", undefined);
    memory.set("lockedAt", undefined);
    await memory.save();

    res.json({ unlocked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to unlock memory" });
  }
};

// ── Block partner ──────────────────────────────────────────────────────────
export const blockPartner = async (req, res) => {
  const { relationshipId } = req.body;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || !validateMembership(rel, req.user.userId))
      return res.status(403).json({ error: true, message: "Access denied" });
    if (rel.status !== "active")
      return res.status(400).json({ error: true, message: "Relationship is not active" });

    rel.status = "blocked";
    await rel.save();
    res.json({ blocked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to block" });
  }
};

export const unblockPartner = async (req, res) => {
  const { relationshipId } = req.body;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || !validateMembership(rel, req.user.userId))
      return res.status(403).json({ error: true, message: "Access denied" });
    if (rel.status !== "blocked")
      return res.status(400).json({ error: true, message: "Relationship is not blocked" });

    rel.status = "active";
    await rel.save();
    res.json({ unblocked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to unblock" });
  }
};

// ── Data export ────────────────────────────────────────────────────────────
export const exportData = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId } = req.query;

  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || !validateMembership(rel, userId))
      return res.status(403).json({ error: true, message: "Access denied" });

    const [messages, memories, plans] = await Promise.all([
      Message.find({ relationshipId, deleted: false }).select("-__v").lean(),
      Memory.find({ relationshipId, deleted: false }).select("-__v -lockPin").lean(),
      Plan.find({ relationshipId, deleted: false }).select("-__v").lean(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      relationshipId,
      messages,
      memories,
      plans,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="pairspace-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch {
    res.status(500).json({ error: true, message: "Export failed" });
  }
};

// ── Session management ─────────────────────────────────────────────────────
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActiveAt: -1 }).select("-sessionToken");
    res.json({ sessions });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch sessions" });
  }
};

export const revokeSession = async (req, res) => {
  try {
    await Session.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user.userId },
      { revoked: true }
    );
    res.json({ revoked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to revoke session" });
  }
};

export const revokeAllSessions = async (req, res) => {
  try {
    await Session.updateMany(
      { userId: req.user.userId, revoked: false },
      { revoked: true }
    );
    res.json({ revoked: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to revoke sessions" });
  }
};

// ── Secure delete chat history ─────────────────────────────────────────────
export const clearChatHistory = async (req, res) => {
  const { relationshipId } = req.body;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel || !validateMembership(rel, req.user.userId))
      return res.status(403).json({ error: true, message: "Access denied" });

    await Message.updateMany({ relationshipId }, { deleted: true, content: "" });
    res.json({ cleared: true });
  } catch {
    res.status(500).json({ error: true, message: "Failed to clear chat" });
  }
};
