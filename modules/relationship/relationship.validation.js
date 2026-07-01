import { body } from "express-validator";

export const inviteValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("relationshipType")
    .optional()
    .isIn(["couple", "best_friend", "partner", "custom"])
    .withMessage("Invalid relationship type"),
];

export const relationshipIdValidation = [
  body("relationshipId")
    .notEmpty()
    .withMessage("relationshipId is required")
    .isMongoId()
    .withMessage("Invalid relationshipId"),
];
