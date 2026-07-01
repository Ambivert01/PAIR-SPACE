import Personalization from "./personalization.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import { PERSONALIZATION_DEFAULTS } from "../../shared/constants/themes.js";
import { cacheGetOrSet, cacheDel } from "../../shared/utils/cache.js";


const ALLOWED = [
  "relationshipName","theme","accentColor","fontStyle","animationLevel",
  "sharedWallpaper","backgroundStyle","chatBubbleStyle","memoryCardStyle",
  "emojiStyle","soundTheme","visualMood","anniversaryTheme",
];

export const getPersonalization = async (req, res) => {
  const { relationshipId } = req.query;
  try {
    const ok = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!ok) return res.status(403).json({ error: true, message: "Access denied" });

    const p = await cacheGetOrSet(
      `personalization:${relationshipId}`,
      () => Personalization.findOneAndUpdate(
        { relationshipId },
        { $setOnInsert: { relationshipId } },
        { new: true, upsert: true }
      ),
      120
    );
    res.json(p);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch personalization" });
  }
};

export const updatePersonalization = async (req, res) => {
  const { relationshipId, ...body } = req.body;
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)));

  if (!relationshipId || Object.keys(updates).length === 0)
    return res.status(422).json({ error: true, message: "No valid fields provided" });

  try {
    const ok = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!ok) return res.status(403).json({ error: true, message: "Access denied" });

    const p = await Personalization.findOneAndUpdate(
      { relationshipId },
      { $set: updates },
      { new: true, upsert: true }
    );
    cacheDel(`personalization:${relationshipId}`);
    res.json(p);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update personalization" });
  }
};

export const resetPersonalization = async (req, res) => {
  const { relationshipId } = req.body;
  try {
    const ok = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!ok) return res.status(403).json({ error: true, message: "Access denied" });

    const p = await Personalization.findOneAndUpdate(
      { relationshipId },
      { $set: { ...PERSONALIZATION_DEFAULTS } },
      { new: true, upsert: true }
    );
    res.json(p);
  } catch {
    res.status(500).json({ error: true, message: "Failed to reset" });
  }
};
