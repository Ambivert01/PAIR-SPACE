import jwt from "jsonwebtoken";
import Relationship from "../relationship/relationship.model.js";
import {
  setPresence, getPresence, deletePresence, refreshTTL,
} from "./presence.store.js";

const HEARTBEAT_INTERVAL = 30_000;  // 30s
const AWAY_TIMEOUT       = 90_000;  // 90s → away
const OFFLINE_TIMEOUT    = 600_000; // 10min → offline

const VALID_STATUSES = [
  "online","offline","away","busy","do_not_disturb",
  "sleeping","working","studying","commuting","traveling",
  "in_call","watching","listening_music","gaming","idle",
];

const VALID_ACTIVITIES = [
  "chatting","watching_video","listening_song","studying_session",
  "focus_mode","gaming","planning","journal_writing",
  "memory_uploading","call_active","screen_sharing","location_sharing",
];

const verifyToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
};

// get partner socket room for a user
const getPartnerRoom = (userId, relationshipId) => `presence_rel_${relationshipId}`;

const initPresenceSocket = (io) => {
  const presence = io.of("/presence");

  // ── JWT auth ───────────────────────────────────────────────────────────
  presence.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    socket.userId = decoded.userId;
    next();
  });

  presence.on("connection", async (socket) => {
    let heartbeatTimer = null;
    let awayTimer = null;
    let offlineTimer = null;
    let relationshipId = null;

    // ── helpers ──────────────────────────────────────────────────────────
    const broadcastToPartner = async (event, data) => {
      if (!relationshipId) return;
      socket.to(getPartnerRoom(socket.userId, relationshipId)).emit(event, data);
    };

    const applyPresence = async (patch) => {
      const current = await getPresence(socket.userId) || {};
      const updated = { ...current, userId: socket.userId, ...patch };

      // visibility filter — what partner actually sees
      const visible = buildVisiblePresence(updated);
      await setPresence(socket.userId, updated);
      await broadcastToPartner("partner_presence_update", visible);
      return updated;
    };

    const resetIdleTimers = () => {
      clearTimeout(awayTimer);
      clearTimeout(offlineTimer);

      awayTimer = setTimeout(async () => {
        await applyPresence({ status: "away" });
      }, AWAY_TIMEOUT);

      offlineTimer = setTimeout(async () => {
        await applyPresence({ status: "offline" });
      }, OFFLINE_TIMEOUT);
    };

    // ── join presence room ────────────────────────────────────────────────
    socket.on("presence_join", async ({ relId }) => {
      try {
        const rel = await Relationship.findById(relId);
        if (!rel || rel.status !== "active") return;
        const isMember = rel.user1Id.toString() === socket.userId ||
                         rel.user2Id.toString() === socket.userId;
        if (!isMember) return;

        relationshipId = relId;
        socket.join(getPartnerRoom(socket.userId, relId));

        // set online
        await applyPresence({
          status: "online",
          relationshipId: relId,
          lastActiveAt: new Date().toISOString(),
          visibility: "visible",
          activity: null,
          customMessage: "",
        });

        // send partner's current presence back to this user
        const partnerId = rel.user1Id.toString() === socket.userId
          ? rel.user2Id.toString()
          : rel.user1Id.toString();

        const partnerPresence = await getPresence(partnerId);
        socket.emit("partner_presence_update",
          partnerPresence ? buildVisiblePresence(partnerPresence) : { userId: partnerId, status: "offline" }
        );

        resetIdleTimers();
      } catch (err) {
      }
    });

    // ── heartbeat ping ────────────────────────────────────────────────────
    socket.on("presence_ping", async () => {
      await refreshTTL(socket.userId);
      const current = await getPresence(socket.userId);
      if (current?.status === "away" || current?.status === "offline") {
        await applyPresence({ status: "online", lastActiveAt: new Date().toISOString() });
      } else {
        await applyPresence({ lastActiveAt: new Date().toISOString() });
      }
      resetIdleTimers();
      socket.emit("presence_pong");
    });

    // ── manual status update ──────────────────────────────────────────────
    socket.on("presence_update", async ({ status, customMessage, visibility }) => {
      const patch = {};
      if (status && VALID_STATUSES.includes(status)) patch.status = status;
      if (customMessage !== undefined) patch.customMessage = customMessage.slice(0, 60);
      if (visibility) patch.visibility = visibility;
      patch.manualOverride = !!status; // manual status blocks auto-detection
      await applyPresence(patch);
      resetIdleTimers();
    });

    // ── activity start ────────────────────────────────────────────────────
    socket.on("presence_activity_start", async ({ activity }) => {
      if (!VALID_ACTIVITIES.includes(activity)) return;
      await applyPresence({ activity, lastActiveAt: new Date().toISOString() });
      resetIdleTimers();
    });

    // ── activity stop ─────────────────────────────────────────────────────
    socket.on("presence_activity_stop", async () => {
      await applyPresence({ activity: null });
    });

    // ── visibility change ─────────────────────────────────────────────────
    socket.on("presence_visibility_change", async ({ visibility }) => {
      const allowed = ["visible", "hidden", "approximate", "manual_only"];
      if (!allowed.includes(visibility)) return;
      await applyPresence({ visibility });
    });

    // ── idle detection ────────────────────────────────────────────────────
    socket.on("presence_idle", async () => {
      const current = await getPresence(socket.userId);
      if (!current?.manualOverride) {
        await applyPresence({ status: "idle" });
      }
    });

    // ── disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      clearTimeout(awayTimer);
      clearTimeout(offlineTimer);
      clearInterval(heartbeatTimer);

      await applyPresence({
        status: "offline",
        activity: null,
        lastActiveAt: new Date().toISOString(),
      });
    });
  });
};

// ── visibility filter ──────────────────────────────────────────────────────
const buildVisiblePresence = (p) => {
  const base = {
    userId: p.userId,
    lastActiveAt: p.lastActiveAt,
    updatedAt: p.updatedAt,
  };

  switch (p.visibility) {
    case "hidden":
      return { ...base, status: "offline", activity: null, customMessage: "" };

    case "approximate":
      return {
        ...base,
        status: ["online", "idle"].includes(p.status) ? "online" : "busy",
        activity: null,
        customMessage: "",
      };

    case "manual_only":
      return {
        ...base,
        status: p.manualOverride ? p.status : "online",
        activity: null,
        customMessage: p.manualOverride ? p.customMessage : "",
      };

    default: // visible
      return {
        ...base,
        status: p.status,
        activity: p.activity,
        customMessage: p.customMessage,
      };
  }
};

export default initPresenceSocket;
