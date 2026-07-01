import { body } from "express-validator";

export const signupValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain a letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
  body("displayName")
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage("Display name must be 2–40 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const profileValidation = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage("Display name must be 2–40 characters"),
  body("avatarUrl").optional().isURL().withMessage("Invalid avatar URL"),
  body("timezone").optional().isString(),
  body("language").optional().isString(),
];
