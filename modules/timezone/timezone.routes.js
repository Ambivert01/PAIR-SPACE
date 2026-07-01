/**
 * Timezone Bridge Module
 *
 * Long-distance couples' #1 logistical frustration: "Wait, what time is it
 * for you?" This module gives both partners a shared view of:
 *   - Each other's local time right now
 *   - The "golden window" — hours when both are likely awake
 *   - The physical distance between stored locations
 *   - Countdown to the next overlap time
 *
 * No timezone math in the frontend — all computed server-side so both
 * partners see the same canonical data regardless of their own timezone.
 */

import express from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import User from "../auth/user.model.js";
import Relationship from "../relationship/relationship.model.js";

const router = express.Router();
router.use(authMiddleware);

// ── helpers ───────────────────────────────────────────────────────────────────

const formatLocalTime = (ianaTimezone) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      weekday: "short",
    }).format(new Date());
  } catch {
    return null;
  }
};

const getHourInTimezone = (ianaTimezone) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    return parseInt(parts.find((p) => p.type === "hour")?.value ?? "12");
  } catch {
    return 12;
  }
};

// "Awake hours" heuristic: 8am–11pm local is considered available
const isLikelyAwake = (hour) => hour >= 8 && hour <= 23;

// Find next hour when BOTH partners are in their awake window
const findNextOverlapHour = (tz1, tz2) => {
  const now = new Date();
  for (let offsetMinutes = 0; offsetMinutes <= 24 * 60; offsetMinutes += 30) {
    const future = new Date(now.getTime() + offsetMinutes * 60_000);
    const h1 = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz1, hour: "numeric", hour12: false }).formatToParts(future).find((p) => p.type === "hour")?.value ?? "12");
    const h2 = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz2, hour: "numeric", hour12: false }).formatToParts(future).find((p) => p.type === "hour")?.value ?? "12");
    if (isLikelyAwake(h1) && isLikelyAwake(h2)) {
      return { minutesFromNow: offsetMinutes, localTime1: formatLocalTime(tz1), localTime2: formatLocalTime(tz2) };
    }
  }
  return null;
};

// Haversine distance between two lat/lng points (in km)
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── GET /api/timezone/bridge/:relationshipId ──────────────────────────────────
router.get("/bridge/:relationshipId", async (req, res) => {
  const { relationshipId } = req.params;
  const userId = req.user.userId;

  const rel = await verifyRelationshipMember(relationshipId, userId).catch(() => null);
  if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

  // Populate both users for their timezone + location data
  const [user1, user2] = await Promise.all([
    User.findById(rel.user1Id).select("displayName avatarUrl timezone location"),
    User.findById(rel.user2Id).select("displayName avatarUrl timezone location"),
  ]);

  const me      = user1._id.toString() === userId ? user1 : user2;
  const partner = user1._id.toString() === userId ? user2 : user1;

  const myTz      = me.timezone      || "UTC";
  const partnerTz = partner.timezone || "UTC";

  const myHour      = getHourInTimezone(myTz);
  const partnerHour = getHourInTimezone(partnerTz);

  // Compute offset difference in hours
  const getOffsetHours = (tz) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
    try {
      const localTime = new Date(new Intl.DateTimeFormat("en-US", {
        timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      }).format(now));
      return 0; // simplified — just provide formatted local times
    } catch { return 0; }
  };

  // Distance
  let distanceKm = null;
  if (
    me.location?.lat && me.location?.lng &&
    partner.location?.lat && partner.location?.lng
  ) {
    distanceKm = Math.round(
      haversineKm(me.location.lat, me.location.lng, partner.location.lat, partner.location.lng)
    );
  }

  const bothAwakeNow = isLikelyAwake(myHour) && isLikelyAwake(partnerHour);
  const nextOverlap  = bothAwakeNow ? null : findNextOverlapHour(myTz, partnerTz);

  res.json({
    me: {
      displayName:  me.displayName,
      avatarUrl:    me.avatarUrl,
      timezone:     myTz,
      localTime:    formatLocalTime(myTz),
      hour:         myHour,
      isAwake:      isLikelyAwake(myHour),
    },
    partner: {
      displayName:  partner.displayName,
      avatarUrl:    partner.avatarUrl,
      timezone:     partnerTz,
      localTime:    formatLocalTime(partnerTz),
      hour:         partnerHour,
      isAwake:      isLikelyAwake(partnerHour),
    },
    bothAwakeNow,
    nextOverlap,
    distanceKm,
    distanceMiles: distanceKm ? Math.round(distanceKm * 0.621371) : null,
  });
});

// ── PATCH /api/timezone/me ────────────────────────────────────────────────────
// Partners update their own timezone + approximate location so the bridge works
router.patch("/me", async (req, res) => {
  const { timezone, location } = req.body;
  const userId = req.user.userId;

  // Validate IANA timezone
  if (timezone) {
    try { Intl.DateTimeFormat(undefined, { timeZone: timezone }); }
    catch { return res.status(400).json({ error: true, message: "Invalid timezone" }); }
  }

  const update = {};
  if (timezone) update.timezone = timezone;
  if (location?.lat && location?.lng) {
    update["location.lat"] = parseFloat(location.lat);
    update["location.lng"] = parseFloat(location.lng);
    update["location.city"] = location.city || "";
  }

  await User.findByIdAndUpdate(userId, update);
  res.json({ success: true });
});

export default router;
