import jwt from "jsonwebtoken";
import Relationship from "../relationship/relationship.model.js";
import Call from "./call.model.js";
import Message from "../chat/message.model.js";

const verifyToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
};

const getActiveRel = async (relationshipId, userId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel || rel.status !== "active") return null;
  const ok = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
  return ok ? rel : null;
};

// room per relationship
const ROOM = (id) => `call_${id}`;

// STUN servers — public Google STUN, no TURN needed for LAN/same-network dev
export const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const initCallSocket = (io) => {
  const call = io.of("/call");

  call.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    socket.userId = decoded.userId;
    next();
  });

  call.on("connection", (socket) => {
    // ── join call room ─────────────────────────────────────────────────
    socket.on("call_join_room", async ({ relationshipId }) => {
      const rel = await getActiveRel(relationshipId, socket.userId);
      if (!rel) { socket.emit("call_error", { message: "Access denied" }); return; }
      socket.join(ROOM(relationshipId));
      socket.relationshipId = relationshipId;
    });

    // ── initiate call ──────────────────────────────────────────────────
    socket.on("call_initiate", async ({ relationshipId, callType = "voice" }) => {
      try {
        const rel = await getActiveRel(relationshipId, socket.userId);
        if (!rel) { socket.emit("call_error", { message: "Cannot call — relationship not active" }); return; }

        const callDoc = await Call.create({
          relationshipId, startedBy: socket.userId, callType, status: "ringing",
        });

        socket.callId = callDoc._id.toString();

        // send offer request to partner
        socket.to(ROOM(relationshipId)).emit("call_incoming", {
          callId:   callDoc._id,
          callType,
          callerId: socket.userId,
          iceServers: ICE_SERVERS,
        });

        socket.emit("call_initiated", { callId: callDoc._id, iceServers: ICE_SERVERS });

        // Auto-timeout: if partner doesn't answer in 30s, mark missed and notify caller
        const CALL_TIMEOUT_MS = 30_000;
        const timeoutHandle = setTimeout(async () => {
          try {
            const call = await Call.findById(callDoc._id);
            if (call && call.status === "ringing") {
              await Call.findByIdAndUpdate(callDoc._id, { status: "missed", endedAt: new Date() });
              socket.emit("call_missed", { callId: callDoc._id });
              socket.to(ROOM(relationshipId)).emit("call_missed", { callId: callDoc._id });
            }
          } catch { /* non-critical */ }
        }, CALL_TIMEOUT_MS);

        // Cancel the timeout if call is answered or rejected before it fires
        const cancelTimeout = () => clearTimeout(timeoutHandle);
        socket.once("call_answer",  cancelTimeout);
        socket.once("call_reject",  cancelTimeout);
        socket.once("call_end",     cancelTimeout);
        socket.once("disconnect",   cancelTimeout);
      } catch { socket.emit("call_error", { message: "Failed to initiate call" }); }
    });

    // ── WebRTC offer ───────────────────────────────────────────────────
    socket.on("call_offer", ({ relationshipId, offer, callId }) => {
      socket.to(ROOM(relationshipId)).emit("call_offer", { offer, callId, from: socket.userId });
    });

    // ── WebRTC answer ──────────────────────────────────────────────────
    socket.on("call_answer", async ({ relationshipId, answer, callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, { status: "accepted", startedAt: new Date() });
        socket.callId = callId;

        // insert system chat message
        const rel = await Relationship.findById(relationshipId);
        if (rel) {
          await Message.create({
            relationshipId, senderId: socket.userId,
            type: "system", content: "📞 Call started", status: "sent",
          });
        }

        socket.to(ROOM(relationshipId)).emit("call_answer", { answer, callId, from: socket.userId });

        // update presence to in_call via presence namespace
        io.of("/presence").emit("_internal_set_activity", { userId: socket.userId, activity: "call_active" });
      } catch { socket.emit("call_error", { message: "Failed to accept call" }); }
    });

    // ── reject call ────────────────────────────────────────────────────
    socket.on("call_reject", async ({ relationshipId, callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, { status: "rejected", endedAt: new Date() });
        socket.to(ROOM(relationshipId)).emit("call_rejected", { callId });
      } catch { /* non-critical */ }
    });

    // ── ICE candidate exchange ─────────────────────────────────────────
    socket.on("call_ice_candidate", ({ relationshipId, candidate, callId }) => {
      socket.to(ROOM(relationshipId)).emit("call_ice_candidate", { candidate, callId, from: socket.userId });
    });

    // ── end call ───────────────────────────────────────────────────────
    socket.on("call_end", async ({ relationshipId, callId }) => {
      try {
        const callDoc = await Call.findById(callId);
        if (callDoc) {
          const duration = callDoc.startedAt
            ? Math.round((Date.now() - new Date(callDoc.startedAt)) / 1000)
            : 0;
          await Call.findByIdAndUpdate(callId, {
            status: "ended", endedAt: new Date(), duration,
          });

          // system chat message
          const mins = Math.floor(duration / 60);
          const secs = duration % 60;
          const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
          await Message.create({
            relationshipId, senderId: socket.userId,
            type: "system", content: `📞 Call ended · ${durationStr}`, status: "sent",
          });
        }

        call.to(ROOM(relationshipId)).emit("call_ended", { callId });
      } catch { /* non-critical */ }
    });

    // ── media toggle (mute/camera) ─────────────────────────────────────
    socket.on("call_media_toggle", ({ relationshipId, kind, enabled }) => {
      socket.to(ROOM(relationshipId)).emit("call_media_toggle", {
        from: socket.userId, kind, enabled,
      });
    });

    // ── screen share ───────────────────────────────────────────────────
    socket.on("call_screen_share_start", ({ relationshipId }) => {
      socket.to(ROOM(relationshipId)).emit("call_screen_share_start", { from: socket.userId });
    });

    socket.on("call_screen_share_stop", ({ relationshipId }) => {
      socket.to(ROOM(relationshipId)).emit("call_screen_share_stop", { from: socket.userId });
    });

    // ── reconnect attempt ──────────────────────────────────────────────
    socket.on("call_reconnect_attempt", async ({ relationshipId, callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, {
          status: "reconnecting",
          $inc: { "metadata.reconnectCount": 1 },
        });
        socket.to(ROOM(relationshipId)).emit("call_reconnecting", { callId, from: socket.userId });
      } catch { /* non-critical */ }
    });

    socket.on("disconnect", async () => {
      // auto-end any active call on disconnect
      if (socket.callId && socket.relationshipId) {
        const callDoc = await Call.findById(socket.callId);
        if (callDoc && ["accepted", "ringing", "reconnecting"].includes(callDoc.status)) {
          const duration = callDoc.startedAt
            ? Math.round((Date.now() - new Date(callDoc.startedAt)) / 1000)
            : 0;
          await Call.findByIdAndUpdate(socket.callId, {
            status: "ended", endedAt: new Date(), duration,
          }).catch(() => {});
          call.to(ROOM(socket.relationshipId)).emit("call_ended", { callId: socket.callId });
        }
      }
    });
  });
};

export default initCallSocket;
