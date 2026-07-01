import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken } from "../helpers/factories.js";
import feedbackRouter from "../../modules/feedback/feedback.routes.js";
import Feedback from "../../modules/feedback/feedback.model.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/feedback", feedbackRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

/**
 * Regression suite for two related critical bugs fixed together:
 *
 * 1. SECURITY: /api/feedback/admin/* routes previously had a
 *    "// TODO: Add admin role check" comment and NO actual authorization —
 *    any logged-in user could read everyone's feedback. Now gated by
 *    adminMiddleware, which requires User.role === "admin".
 *
 * 2. DATA INTEGRITY: feedback.routes.js read `req.user.id`, but
 *    authMiddleware sets `req.user.userId` — so every feedback submission
 *    silently saved `userId: undefined`. Fixed to use `req.user.userId`.
 */
describe("POST /api/feedback/submit", () => {
  it("correctly attributes feedback to the submitting user", async () => {
    const user = await makeUser();
    const res = await request(app)
      .post("/api/feedback/submit")
      .set("Authorization", `Bearer ${makeToken(user)}`)
      .send({ type: "bug", category: "general", title: "Bug", description: "Something broke" });

    expect(res.status).toBe(201);
    const saved = await Feedback.findById(res.body.feedbackId);
    // This is the core regression check: userId must NOT be undefined/null
    expect(saved.userId.toString()).toBe(user._id.toString());
  });
});

describe("GET /api/feedback/admin/all — authorization", () => {
  it("rejects a regular (non-admin) user with 403", async () => {
    const regularUser = await makeUser({ role: "user" });
    const res = await request(app)
      .get("/api/feedback/admin/all")
      .set("Authorization", `Bearer ${makeToken(regularUser)}`);
    expect(res.status).toBe(403);
  });

  it("allows access for a user with role 'admin'", async () => {
    const admin = await makeUser({ role: "admin" });
    const res = await request(app)
      .get("/api/feedback/admin/all")
      .set("Authorization", `Bearer ${makeToken(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.feedback).toBeDefined();
  });
});

describe("GET /api/feedback/admin/stats — authorization", () => {
  it("rejects a regular user with 403", async () => {
    const regularUser = await makeUser();
    const res = await request(app)
      .get("/api/feedback/admin/stats")
      .set("Authorization", `Bearer ${makeToken(regularUser)}`);
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/feedback/admin/:feedbackId/status — authorization", () => {
  it("rejects a regular user with 403", async () => {
    const [submitter, regularUser] = await Promise.all([makeUser(), makeUser()]);
    const fb = await Feedback.create({
      userId: submitter._id, type: "bug", category: "general",
      title: "T", description: "D", status: "new",
    });
    const res = await request(app)
      .patch(`/api/feedback/admin/${fb._id}/status`)
      .set("Authorization", `Bearer ${makeToken(regularUser)}`)
      .send({ status: "resolved" });
    expect(res.status).toBe(403);
  });
});
