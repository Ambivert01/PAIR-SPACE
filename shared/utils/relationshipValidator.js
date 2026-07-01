import Relationship from "../../modules/relationship/relationship.model.js";

/**
 * Verify user is a member of the relationship and it's active.
 * Returns the relationship document or null.
 */
export const verifyRelationshipMember = async (relationshipId, userId, { requireActive = true } = {}) => {
  if (!relationshipId || !userId) return null;
  const rel = await Relationship.findById(relationshipId);
  if (!rel) return null;
  if (requireActive && rel.status !== "active") return null;
  const isMember = rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
  return isMember ? rel : null;
};

/**
 * Get partner ID from a relationship for a given user.
 */
export const getPartnerId = (rel, userId) => {
  if (!rel) return null;
  return rel.user1Id.toString() === userId
    ? rel.user2Id.toString()
    : rel.user1Id.toString();
};

/**
 * Express middleware — attaches validated relationship to req.relationship.
 * Reads relationshipId from body, query, or params.
 */
export const relationshipContextMiddleware = async (req, res, next) => {
  const relationshipId =
    req.body?.relationshipId ||
    req.query?.relationshipId ||
    req.params?.relationshipId;

  if (!relationshipId) return next(); // optional — some routes don't need it

  const rel = await verifyRelationshipMember(relationshipId, req.user?.userId).catch(() => null);
  if (!rel) {
    return res.status(403).json({ success: false, error: { message: "Access denied", code: "FORBIDDEN" } });
  }

  req.relationship = rel;
  next();
};
