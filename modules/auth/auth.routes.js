import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signup, login, getMe, updateProfile, logout } from "./auth.controller.js";
import { signupValidation, loginValidation, profileValidation } from "./auth.validation.js";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: true, message: "Too many login attempts. Try again later." },
});

router.post("/signup", signupValidation, signup);
router.post("/login", loginLimiter, loginValidation, login);
router.get("/me", authMiddleware, getMe);
router.patch("/profile", authMiddleware, profileValidation, updateProfile);
router.post("/logout", authMiddleware, logout);

export default router;
