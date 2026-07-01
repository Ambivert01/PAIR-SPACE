import { UserSettings, RelationshipSettings } from "./settings.model.js";
import Relationship from "../relationship/relationship.model.js";
import { cacheGetOrSet, cacheDel } from "../../shared/utils/cache.js";

// ── User Settings ──────────────────────────────────────────────────────────
export const getUserSettings = async (req, res) => {
  try {
    const settings = await cacheGetOrSet(
      `user_settings:${req.user.userId}`,
      () => UserSettings.findOneAndUpdate(
        { userId: req.user.userId },
        { $setOnInsert: { userId: req.user.userId } },
        { new: true, upsert: true }
      ),
      120
    );
    res.json(settings);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch settings" });
  }
};

export const updateUserSettings = async (req, res) => {
  const ALLOWED_SECTIONS = ["appearance","notifications","privacy","ai","chat","calls","data"];
  const updates = {};

  for (const section of ALLOWED_SECTIONS) {
    if (req.body[section] && typeof req.body[section] === "object") {
      for (const [key, val] of Object.entries(req.body[section])) {
        updates[`${section}.${key}`] = val;
      }
    }
  }

  if (Object.keys(updates).length === 0)
    return res.status(422).json({ error: true, message: "No valid settings provided" });

  try {
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    cacheDel(`user_settings:${req.user.userId}`);
    res.json(settings);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update settings" });
  }
};

// ── Relationship Settings ──────────────────────────────────────────────────
export const getRelationshipSettings = async (req, res) => {
  const { relationshipId } = req.query;
  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === req.user.userId || rel.user2Id.toString() === req.user.userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });

    const settings = await cacheGetOrSet(
      `rel_settings:${relationshipId}`,
      () => RelationshipSettings.findOneAndUpdate(
        { relationshipId },
        { $setOnInsert: { relationshipId } },
        { new: true, upsert: true }
      ),
      120
    );
    res.json(settings);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch relationship settings" });
  }
};

export const updateRelationshipSettings = async (req, res) => {
  const { relationshipId } = req.body;
  const ALLOWED = [
    "sharedTheme","memoryVisibilityDefault","allowGames","allowAIInsights",
    "allowSharedActivities","allowPlannerSuggestions","anniversaryReminders",
    "customRelationshipName","sharedWallpaper",
  ];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => ALLOWED.includes(k)));

  if (!relationshipId || Object.keys(updates).length === 0)
    return res.status(422).json({ error: true, message: "No valid settings provided" });

  try {
    const rel = await Relationship.findById(relationshipId);
    if (!rel) return res.status(404).json({ error: true, message: "Not found" });
    const isMember = rel.user1Id.toString() === req.user.userId || rel.user2Id.toString() === req.user.userId;
    if (!isMember) return res.status(403).json({ error: true, message: "Access denied" });

    const settings = await RelationshipSettings.findOneAndUpdate(
      { relationshipId },
      { $set: updates },
      { new: true, upsert: true }
    );
    cacheDel(`rel_settings:${relationshipId}`);
    res.json(settings);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update relationship settings" });
  }
};

// ── Helper: create defaults (called on signup / relationship accept) ────────
export const createUserSettingsDefault = async (userId) => {
  await UserSettings.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true }
  ).catch(() => {});
};

export const createRelationshipSettingsDefault = async (relationshipId) => {
  await RelationshipSettings.findOneAndUpdate(
    { relationshipId },
    { $setOnInsert: { relationshipId } },
    { upsert: true }
  ).catch(() => {});
};
