import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import plannerRouter from "../../modules/planner/plan.routes.js";
import Plan from "../../modules/planner/plan.model.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/planner", plannerRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const makePlan = (rel, user, overrides = {}) =>
  Plan.create({
    relationshipId: rel._id,
    createdBy: user._id,
    type: "task",
    title: "Test Plan",
    status: "pending",
    participants: [rel.user1Id, rel.user2Id],
    ...overrides,
  });

describe("POST /api/planner/create", () => {
  it("creates a plan", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .post("/api/planner/create")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id, type: "goal", title: "Learn guitar" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Learn guitar");
  });

  it("rejects missing title", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .post("/api/planner/create")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id, type: "goal" });
    expect(res.status).toBe(422);
  });

  it("blocks non-member", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .post("/api/planner/create")
      .set("Authorization", `Bearer ${makeToken(c)}`)
      .send({ relationshipId: rel._id, type: "task", title: "Hack" });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/planner/list", () => {
  it("returns plans for relationship", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await makePlan(rel, a);
    const res = await request(app)
      .get(`/api/planner/list?relationshipId=${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.plans.length).toBeGreaterThan(0);
  });

  it("filters by type", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await makePlan(rel, a, { type: "goal" });
    await makePlan(rel, a, { type: "habit" });
    const res = await request(app)
      .get(`/api/planner/list?relationshipId=${rel._id}&type=goal`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.body.plans.every((p) => p.type === "goal")).toBe(true);
  });
});

describe("PATCH /api/planner/:planId", () => {
  it("updates plan status to completed", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const plan = await makePlan(rel, a);
    const res = await request(app)
      .patch(`/api/planner/${plan._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ status: "completed" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
    expect(res.body.progress).toBe(100);
  });
});

describe("DELETE /api/planner/:planId", () => {
  it("soft deletes plan", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const plan = await makePlan(rel, a);
    const res = await request(app)
      .delete(`/api/planner/${plan._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    const deleted = await Plan.findById(plan._id);
    expect(deleted.deleted).toBe(true);
  });
});

describe("POST /api/planner/:planId/habit-complete", () => {
  it("logs habit and increments streak", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const plan = await makePlan(rel, a, { type: "habit", streakCount: 0 });
    const res = await request(app)
      .post(`/api/planner/${plan._id}/habit-complete`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.streakCount).toBe(1);
  });

  it("rejects duplicate completion same day", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const plan = await makePlan(rel, a, { type: "habit" });
    await request(app)
      .post(`/api/planner/${plan._id}/habit-complete`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    const res = await request(app)
      .post(`/api/planner/${plan._id}/habit-complete`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(409);
  });
});
