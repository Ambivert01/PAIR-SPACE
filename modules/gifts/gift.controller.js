import Gift from "./gift.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import Memory from "../memory/memory.model.js";
import Message from "../chat/message.model.js";
import { createNotification } from "../notification/notification.service.js";


const isRevealed = (gift) => {
  if (gift.revealMode === "instant") return true;
  if (gift.revealMode === "scheduled" && gift.scheduledRevealTime)
    return new Date() >= new Date(gift.scheduledRevealTime);
  if (gift.revealMode === "countdown" && gift.scheduledRevealTime)
    return new Date() >= new Date(gift.scheduledRevealTime);
  return false;
};

// ── Send gift ──────────────────────────────────────────────────────────────
export const sendGift = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, giftType, title, message, mediaId, revealMode, scheduledRevealTime, countdownDays, revealAnimation } = req.body;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    let revealTime = null;
    if (revealMode === "scheduled" && scheduledRevealTime) {
      revealTime = new Date(scheduledRevealTime);
    } else if (revealMode === "countdown" && countdownDays > 0) {
      revealTime = new Date(Date.now() + countdownDays * 86400000);
    }

    const gift = await Gift.create({
      relationshipId, senderId: userId, giftType,
      title: title?.trim() || "",
      message: message?.trim() || "",
      mediaId: mediaId || null,
      revealMode: revealMode || "instant",
      scheduledRevealTime: revealTime,
      countdownDays: countdownDays || 0,
      revealAnimation: revealAnimation || "confetti",
    });

    // system chat message
    await Message.create({
      relationshipId, senderId: userId,
      type: "system",
      content: `🎁 Sent a surprise gift`,
      status: "sent",
    });

    // notify partner
    const partnerId = rel.user1Id.toString() === userId ? rel.user2Id.toString() : rel.user1Id.toString();
    const notifMsg = revealMode === "instant"
      ? "You have a gift waiting! 🎁"
      : `A surprise is coming your way ${revealTime ? `on ${new Date(revealTime).toLocaleDateString()}` : "soon"}`;

    createNotification({
      userId: partnerId, relationshipId,
      type: "system_alert",
      title: "You received a gift! 🎁",
      message: notifMsg,
      priority: revealMode === "instant" ? "high" : "normal",
      scheduledFor: revealTime || null,
    }).catch(() => {});
    res.status(201).json(gift);
  } catch {
    res.status(500).json({ error: true, message: "Failed to send gift" });
  }
};

// ── List gifts ─────────────────────────────────────────────────────────────
export const listGifts = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, limit = 20 } = req.query;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const gifts = await Gift.find({ relationshipId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("senderId", "displayName avatarUrl")
      .populate("mediaId", "url thumbnailUrl type");

    // apply reveal rules — hide content of unrevealed gifts from recipient
    const filtered = gifts.map((g) => {
      const isSender = g.senderId._id?.toString() === userId || g.senderId?.toString() === userId;
      const revealed = isRevealed(g);
      if (!isSender && !revealed) {
        return {
          _id: g._id, giftType: g.giftType, revealMode: g.revealMode,
          scheduledRevealTime: g.scheduledRevealTime, countdownDays: g.countdownDays,
          senderId: g.senderId, createdAt: g.createdAt, opened: g.opened,
          _hidden: true,
        };
      }
      return g;
    });

    res.json({ gifts: filtered });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch gifts" });
  }
};

// ── Open gift ──────────────────────────────────────────────────────────────
export const openGift = async (req, res) => {
  const userId = req.user.userId;
  try {
    const gift = await Gift.findById(req.params.giftId)
      .populate("senderId", "displayName avatarUrl")
      .populate("mediaId", "url thumbnailUrl type");

    if (!gift) return res.status(404).json({ error: true, message: "Gift not found" });

    const rel = await verifyRelationshipMember(gift.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    // can't open own gift
    const isSender = gift.senderId._id?.toString() === userId || gift.senderId?.toString() === userId;
    if (isSender) return res.status(400).json({ error: true, message: "Cannot open your own gift" });

    if (!isRevealed(gift))
      return res.status(403).json({ error: true, message: "Gift not yet revealed" });

    if (!gift.opened) {
      gift.opened = true;
      gift.openedAt = new Date();
      await gift.save();
    }

    res.json(gift);
  } catch {
    res.status(500).json({ error: true, message: "Failed to open gift" });
  }
};

// ── React to gift ──────────────────────────────────────────────────────────
export const reactToGift = async (req, res) => {
  const userId = req.user.userId;
  const { emoji } = req.body;
  try {
    const gift = await Gift.findById(req.params.giftId);
    if (!gift) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(gift.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    gift.reaction = emoji;
    await gift.save();
    res.json({ reaction: gift.reaction });
  } catch {
    res.status(500).json({ error: true, message: "Failed to react" });
  }
};

// ── Convert to memory ──────────────────────────────────────────────────────
export const convertGiftToMemory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const gift = await Gift.findById(req.params.giftId);
    if (!gift) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(gift.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const memory = await Memory.create({
      relationshipId: gift.relationshipId,
      creatorId: userId,
      type: "milestone",
      title: gift.title || `Gift: ${gift.giftType.replace(/_/g, " ")}`,
      description: gift.message || "",
      emotionTag: "celebration",
      visibility: "visible",
    });

    res.status(201).json({ memoryId: memory._id });
  } catch {
    res.status(500).json({ error: true, message: "Failed to convert" });
  }
};

// ── Scheduled gift delivery (called by cron) ───────────────────────────────
export const deliverScheduledGifts = async () => {
  try {
    const due = await Gift.find({
      revealMode: { $in: ["scheduled","countdown"] },
      scheduledRevealTime: { $lte: new Date() },
      opened: false,
    }).populate("senderId", "displayName");

    for (const gift of due) {
      const rel = await Relationship.findById(gift.relationshipId);
      if (!rel) continue;
      const partnerId = rel.user1Id.toString() === gift.senderId._id?.toString()
        ? rel.user2Id.toString() : rel.user1Id.toString();
      createNotification({
        userId: partnerId, relationshipId: gift.relationshipId,
        type: "system_alert",
        title: "🎁 Your surprise is ready!",
        message: `${gift.senderId.displayName} sent you a gift — open it now!`,
        priority: "high",
      });
    }
  } catch { /* non-critical */ }
};
