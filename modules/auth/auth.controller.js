import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../../modules/auth/user.model.js";
import { createUserSettingsDefault } from "../settings/settings.controller.js";
import Session from "../privacy/session.model.js";
import { getDeviceInfo } from "../../shared/utils/securityHelpers.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

const generateToken = (user) =>
  jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

const safeUser = (user) => ({
  id: user._id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  timezone: user.timezone,
  language: user.language,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const validationError = (res, errors) =>
  res.status(422).json({ error: true, message: errors.array()[0].msg });

export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);

  const { email, password, displayName } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: true, message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, passwordHash, displayName });
    const token = generateToken(user);

    // create default settings
    createUserSettingsDefault(user._id);

    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: true, message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: true, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: true, message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    // create session record
    const { userAgent, ip } = getDeviceInfo(req);
    Session.create({
      userId: user._id,
      sessionToken: token,
      device: userAgent,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600000),
    }).catch(() => {});

    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: true, message: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    res.json({ user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: true, message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors);

  const allowed = ["displayName", "avatarUrl", "timezone", "language"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  try {
    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: true, message: "Profile update failed" });
  }
};

export const logout = (_req, res) => {
  res.json({ message: "Logged out" });
};
