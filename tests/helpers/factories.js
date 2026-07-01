import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../modules/auth/user.model.js";
import Relationship from "../../modules/relationship/relationship.model.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";

export const makeUser = async (overrides = {}) => {
  const passwordHash = await bcrypt.hash("Password1", 10);
  return User.create({
    email: `user_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
    passwordHash,
    displayName: "Test User",
    ...overrides,
  });
};

export const makeToken = (user) =>
  jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const makeRelationship = async (user1, user2, status = "active") =>
  Relationship.create({ user1Id: user1._id, user2Id: user2._id, status });

export const authHeader = (user) => ({ Authorization: `Bearer ${makeToken(user)}` });
