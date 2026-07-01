import jwt from "jsonwebtoken";
import Relationship from "../relationship/relationship.model.js";
import Message from "./message.model.js";
import { createNotification } from "../notification/notification.service.js";
import { processMessageEvent } from "../ai/ai.processor.js";
import { checkMilestones } from "../ai-story/story.generator.js";

const ROOM = (id) => `relationship_${id}`;

const verifyToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
};

const getActiveRelationship = async (relationshipId, userId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel || rel.status !== "active") return null;
  const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
  return isMember ? rel : null;
};

const initChatSocket = (io) => {
  const chat = io.of("/chat");

  chat.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    socket.userId = decoded.userId;
    next();
  });

  chat.on("connection", (socket) => {
    // ── join room ──────────────────────────────────────────────
    socket.on("join_relationship_room", async ({ relationshipId }) => {
      try {
        const rel = await getActiveRelationship(relationshipId, socket.userId);
        if (!rel) { socket.emit("error", { message: "Cannot join room" }); return; }

        socket.join(ROOM(relationshipId));
        socket.relationshipId = relationshipId;

        await Message.updateMany(
          { relationshipId, senderId: { $ne: socket.userId }, status: "sent" },
          { status: "delivered" }
        );
        socket.emit("room_joined", { relationshipId });
      } catch { socket.emit("error", { message: "Failed to join room" }); }
    });

    // ── send message ───────────────────────────────────────────
    socket.on("send_message", async ({ relationshipId, content, type = "text", replyToMessageId, metadata, mediaUrl, thumbnailUrl }) => {
      try {
        if (type === "text" && !content?.trim()) return;
        if (content?.length > 2000) { socket.emit("error", { message: "Message too long" }); return; }

        const rel = await getActiveRelationship(relationshipId, socket.userId);
        if (!rel) { socket.emit("error", { message: "Cannot send — relationship not active" }); return; }

        const msgData = {
          relationshipId,
          senderId: socket.userId,
          type,
          content: content?.trim() || "",
          status: "sent",
        };
        if (replyToMessageId) msgData.replyToMessageId = replyToMessageId;
        if (metadata)     msgData.metadata     = metadata;
        if (mediaUrl)     msgData.mediaUrl     = mediaUrl;
        if (thumbnailUrl) msgData.thumbnailUrl = thumbnailUrl;

        const message = await Message.create(msgData);

        // populate reply preview
        let populated = message.toObject();
        if (replyToMessageId) {
          const replyTo = await Message.findById(replyToMessageId).select("content type senderId deleted");
          populated.replyTo = replyTo;
        }

        const room = chat.adapter.rooms.get(ROOM(relationshipId));
        if (room && room.size > 1) {
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });
          populated.status = "delivered";
        }

        chat.to(ROOM(relationshipId)).emit("receive_message", populated);

        // notify partner
        const partnerId = rel.user1Id.toString() === socket.userId
          ? rel.user2Id.toString() : rel.user1Id.toString();
        createNotification({
          userId: partnerId, relationshipId,
          type: "message_received",
          title: "New message",
          message: (content?.trim() || "").slice(0, 60),
          entityType: "message", entityId: message._id,
          priority: "normal",
        }).catch(() => {});
        // AI processing — fire and forget
        processMessageEvent(relationshipId, socket.userId, content?.trim() || "").catch(() => {});
        // milestone check — fire and forget
        // Only run milestone check every 10 messages to avoid N+1 DB query per message
        const saved = await Message.countDocuments({ relationshipId, deleted: { $ne: true } });
        if (saved % 10 === 0) {
          checkMilestones(relationshipId).catch(() => {});
        }
      } catch { socket.emit("error", { message: "Failed to send message" }); }
    });

    // ── edit message ───────────────────────────────────────────
    socket.on("message_edit", async ({ messageId, content, relationshipId }) => {
      try {
        if (!content?.trim()) return;
        const message = await Message.findById(messageId);
        if (!message || message.senderId.toString() !== socket.userId) {
          socket.emit("error", { message: "Cannot edit this message" }); return;
        }
        if (message.deleted) { socket.emit("error", { message: "Cannot edit deleted message" }); return; }
        if (message.type !== "text") { socket.emit("error", { message: "Only text messages can be edited" }); return; }

        message.content = content.trim();
        message.edited = true;
        await message.save();

        chat.to(ROOM(relationshipId)).emit("message_updated", {
          messageId, content: message.content, edited: true,
        });
      } catch { socket.emit("error", { message: "Failed to edit message" }); }
    });

    // ── delete message (soft) ──────────────────────────────────
    socket.on("message_delete", async ({ messageId, relationshipId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.senderId.toString() !== socket.userId) {
          socket.emit("error", { message: "Cannot delete this message" }); return;
        }

        message.deleted = true;
        message.content = "";
        message.mediaUrl = "";
        await message.save();

        chat.to(ROOM(relationshipId)).emit("message_deleted", { messageId });
      } catch { socket.emit("error", { message: "Failed to delete message" }); }
    });

    // ── reaction add ───────────────────────────────────────────
    socket.on("reaction_add", async ({ messageId, emoji, relationshipId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.deleted) return;

        // remove existing reaction from this user, then add new
        message.reactions = message.reactions.filter(
          (r) => r.userId.toString() !== socket.userId
        );
        message.reactions.push({ userId: socket.userId, emoji });
        await message.save();

        chat.to(ROOM(relationshipId)).emit("reaction_updated", {
          messageId, reactions: message.reactions,
        });
      } catch { socket.emit("error", { message: "Failed to add reaction" }); }
    });

    // ── reaction remove ────────────────────────────────────────
    socket.on("reaction_remove", async ({ messageId, relationshipId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        message.reactions = message.reactions.filter(
          (r) => r.userId.toString() !== socket.userId
        );
        await message.save();

        chat.to(ROOM(relationshipId)).emit("reaction_updated", {
          messageId, reactions: message.reactions,
        });
      } catch { socket.emit("error", { message: "Failed to remove reaction" }); }
    });

    // ── typing ─────────────────────────────────────────────────
    socket.on("typing_start", ({ relationshipId, typingType = "text" }) => {
      socket.to(ROOM(relationshipId)).emit("typing_start", { userId: socket.userId, typingType });
    });
    socket.on("typing_stop", ({ relationshipId }) => {
      socket.to(ROOM(relationshipId)).emit("typing_stop", { userId: socket.userId });
    });

    // ── voice recording indicators ─────────────────────────────
    socket.on("voice_recording_start", ({ relationshipId }) => {
      socket.to(ROOM(relationshipId)).emit("typing_start", { userId: socket.userId, typingType: "voice" });
    });
    socket.on("voice_recording_stop", ({ relationshipId }) => {
      socket.to(ROOM(relationshipId)).emit("typing_stop", { userId: socket.userId });
    });

    // ── read receipt ───────────────────────────────────────────
    socket.on("message_read", async ({ messageId, relationshipId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: "read" });
        socket.to(ROOM(relationshipId)).emit("message_status_update", { messageId, status: "read" });
      } catch { /* non-critical */ }
    });

    socket.on("disconnect", () => {
    });
  });
};

export default initChatSocket;
