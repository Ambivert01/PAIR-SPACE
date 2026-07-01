import jwt from "jsonwebtoken";
import Relationship from "../relationship/relationship.model.js";
import Activity from "./activity.model.js";
import Message from "../chat/message.model.js";

const verifyToken = (t) => { try { return jwt.verify(t, process.env.JWT_SECRET); } catch { return null; } };
const ROOM = (id) => `activity_${id}`;
const DRIFT_THRESHOLD = 0.5; // seconds

const ACTIVITY_LABELS = {
  watch_together:           "started watching together 🎬",
  listen_together:          "started listening together 🎧",
  focus_session:            "started a focus session ⏳",
  study_session:            "started a study session 📚",
  game_session:             "started a game session 🎮",
  planning_session:         "started a planning session 📅",
  memory_creation_session:  "started creating memories 📸",
  reading_session:          "started reading together 📖",
  custom_session:           "started a shared session ✨",
};

const getActiveRel = async (relationshipId, userId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel || rel.status !== "active") return null;
  const ok = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
  return ok ? rel : null;
};

const initActivitySocket = (io) => {
  const activity = io.of("/activity");

  activity.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    socket.userId = decoded.userId;
    next();
  });

  activity.on("connection", (socket) => {
    // ── create activity ────────────────────────────────────────────────
    socket.on("activity_create", async ({ relationshipId, activityType, metadata = {} }) => {
      try {
        const rel = await getActiveRel(relationshipId, socket.userId);
        if (!rel) { socket.emit("activity_error", { message: "Access denied" }); return; }

        // cancel any existing active activity
        await Activity.updateMany(
          { relationshipId, status: { $in: ["created", "active", "paused"] } },
          { status: "cancelled" }
        );

        const act = await Activity.create({
          relationshipId, activityType,
          createdBy: socket.userId,
          participants: [socket.userId],
          metadata,
        });

        socket.join(ROOM(act._id.toString()));
        socket.activityId = act._id.toString();

        // notify partner
        socket.to(ROOM(relationshipId)).emit("activity_invite", {
          activityId:   act._id,
          activityType,
          createdBy:    socket.userId,
          metadata,
        });

        // also broadcast to relationship room (for users not yet in activity room)
        io.of("/chat").to(`relationship_${relationshipId}`).emit("activity_invite", {
          activityId: act._id, activityType, createdBy: socket.userId, metadata,
        });

        socket.emit("activity_created", { activity: act });
      } catch { socket.emit("activity_error", { message: "Failed to create activity" }); }
    });

    // ── join activity ──────────────────────────────────────────────────
    socket.on("activity_join", async ({ activityId, relationshipId }) => {
      try {
        const rel = await getActiveRel(relationshipId, socket.userId);
        if (!rel) { socket.emit("activity_error", { message: "Access denied" }); return; }

        const act = await Activity.findById(activityId);
        if (!act || act.status === "ended" || act.status === "cancelled") {
          socket.emit("activity_error", { message: "Activity not available" }); return;
        }

        if (!act.participants.includes(socket.userId)) {
          act.participants.push(socket.userId);
        }
        if (act.status === "created") {
          act.status = "active";
          act.startedAt = new Date();
        }
        await act.save();

        socket.join(ROOM(activityId));
        socket.activityId = activityId;

        // insert system chat message
        const label = ACTIVITY_LABELS[act.activityType] || "started a session";
        await Message.create({
          relationshipId, senderId: socket.userId,
          type: "system", content: `${label}`, status: "sent",
        });

        // Ask the initiator to report their LIVE currentTime so the joiner
        // syncs to the right position. The initiator will emit
        // "activity_position_report" which we forward to the joiner.
        socket.to(ROOM(activityId)).emit("activity_request_position", {
          activityId, requestedBy: socket.userId,
        });

        // Also send the DB state as an immediate (possibly stale) starting
        // point so the joiner isn't stuck on a blank screen while waiting.
        socket.emit("activity_joined", { activity: act });

        // notify others in room that partner joined
        socket.to(ROOM(activityId)).emit("activity_partner_joined", {
          activityId, userId: socket.userId, state: act.state,
        });
      } catch { socket.emit("activity_error", { message: "Failed to join activity" }); }
    });

    // ── state update (play/pause/seek/speed/volume) ────────────────────
    socket.on("activity_state_update", async ({ activityId, state }) => {
      try {
        const act = await Activity.findById(activityId);
        if (!act) return;

        Object.assign(act.state, state);
        act.status = state.paused ? "paused" : "active";
        await act.save();

        socket.to(ROOM(activityId)).emit("activity_state_update", {
          activityId, state: act.state, from: socket.userId,
        });
      } catch { /* non-critical */ }
    });

    // ── pause ──────────────────────────────────────────────────────────
    socket.on("activity_pause", async ({ activityId, currentTime }) => {
      try {
        await Activity.findByIdAndUpdate(activityId, {
          "state.paused": true, "state.currentTime": currentTime, status: "paused",
        });
        socket.to(ROOM(activityId)).emit("activity_pause", { activityId, currentTime, from: socket.userId });
      } catch { /* non-critical */ }
    });

    // ── resume ─────────────────────────────────────────────────────────
    socket.on("activity_resume", async ({ activityId, currentTime }) => {
      try {
        await Activity.findByIdAndUpdate(activityId, {
          "state.paused": false, "state.currentTime": currentTime, status: "active",
        });
        socket.to(ROOM(activityId)).emit("activity_resume", { activityId, currentTime, from: socket.userId });
      } catch { /* non-critical */ }
    });

    // ── seek ───────────────────────────────────────────────────────────
    socket.on("activity_seek", async ({ activityId, currentTime }) => {
      try {
        await Activity.findByIdAndUpdate(activityId, { "state.currentTime": currentTime });
        socket.to(ROOM(activityId)).emit("activity_seek", { activityId, currentTime, from: socket.userId });
      } catch { /* non-critical */ }
    });

    // ── sync ping — drift correction ───────────────────────────────────
    // The reporter sends their current player position every 5 seconds.
    // We write it to the DB so any late-joining partner gets an accurate
    // position, and we send a correction back if the other client has drifted.
    socket.on("activity_sync_ping", async ({ activityId, clientTime }) => {
      try {
        const act = await Activity.findById(activityId);
        if (!act || act.state.paused) return;

        // Write the reporter's current position to the DB so that when a
        // late-joining partner calls activity_join they get the real time,
        // not the stale position from the last pause/seek/resume event.
        await Activity.findByIdAndUpdate(activityId, {
          "state.currentTime": clientTime,
          syncedAt: new Date(),
        });

        // Forward to the OTHER participant so they can self-correct drift.
        socket.to(ROOM(activityId)).emit("activity_sync_ping_echo", {
          activityId, currentTime: clientTime, from: socket.userId,
        });
      } catch { /* non-critical */ }
    });

    // ── position report — sent by initiator when partner joins ─────────
    // Initiator receives "activity_request_position", reads their live
    // player position, and emits this event. We forward it to the joiner.
    socket.on("activity_position_report", ({ activityId, currentTime, paused }) => {
      socket.to(ROOM(activityId)).emit("activity_sync_correct", {
        activityId, currentTime, paused,
      });
      // Also write to DB so the next join (e.g. reconnect) gets a fresh value.
      Activity.findByIdAndUpdate(activityId, {
        "state.currentTime": currentTime,
        "state.paused": paused,
      }).catch(() => {});
    });

    // ── end activity ───────────────────────────────────────────────────
    socket.on("activity_end", async ({ activityId, relationshipId }) => {
      try {
        const act = await Activity.findById(activityId);
        if (!act) return;

        const duration = act.startedAt
          ? Math.round((Date.now() - new Date(act.startedAt)) / 1000)
          : 0;

        await Activity.findByIdAndUpdate(activityId, {
          status: "ended", endedAt: new Date(),
        });

        const mins = Math.floor(duration / 60);
        const label = ACTIVITY_LABELS[act.activityType]?.replace("started", "ended") || "ended session";
        const durationStr = mins > 0 ? ` · ${mins}m` : "";

        await Message.create({
          relationshipId, senderId: socket.userId,
          type: "system", content: `${label}${durationStr}`, status: "sent",
        });

        activity.to(ROOM(activityId)).emit("activity_ended", { activityId });
      } catch { /* non-critical */ }
    });

    socket.on("disconnect", () => {
    });
  });
};

export default initActivitySocket;
