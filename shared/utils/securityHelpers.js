import bcrypt from "bcryptjs";

// Strip HTML tags and dangerous characters from user input
export const sanitizeInput = (str = "") =>
  String(str).replace(/<[^>]*>/g, "").replace(/[<>'"`;]/g, "").trim().slice(0, 5000);

// Validate that userId is a member of the relationship
export const validateMembership = (rel, userId) => {
  if (!rel) return false;
  return rel.user1Id.toString() === userId || rel.user2Id.toString() === userId;
};

// Hash a PIN (4-6 digits)
export const hashPin = (pin) => bcrypt.hash(String(pin), 10);

// Verify a PIN against its hash
export const verifyPin = (pin, hash) => bcrypt.compare(String(pin), hash);

// Generate a simple device fingerprint from request headers
export const getDeviceInfo = (req) => ({
  userAgent: req.headers["user-agent"]?.slice(0, 200) || "unknown",
  ip: req.ip || req.connection?.remoteAddress || "unknown",
});
