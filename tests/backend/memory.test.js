import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import memoryRouter from "../../modules/memory/memory.routes.js";
import Memory from "../../modules/memory/memory.model.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/memory", memoryRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const makeMemory = (rel, user, overrides = {}) =>
  Memory.create({
    relationshipId: rel._id,
    creatorId: user._id,
    type: "text_note",
    title: "Test Memory",
    description: "A test description",
    emotionTag: "happy",
    visibility: "visible",
    ...overrides,
  });

describe("POST /api/memory/create", () => {
  it("creates memory for relationship member", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .post("/api/memory/create")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id, type: "text_note", title: "First Memory", emotionTag: "happy" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("First Memory");
  });

  it("blocks non-member from creating memory", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .post("/api/memory/create")
      .set("Authorization", `Bearer ${makeToken(c)}`)
      .send({ relationshipId: rel._id, type: "text_note", title: "Hack" });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/memory/timeline", () => {
  it("returns memories for member", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await makeMemory(rel, a);
    const res = await request(app)
      .get(`/api/memory/timeline?relationshipId=${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.memories.length).toBeGreaterThan(0);
  });

  it("filters by emotionTag", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await makeMemory(rel, a, { emotionTag: "happy" });
    await makeMemory(rel, a, { emotionTag: "sad" });
    const res = await request(app)
      .get(`/api/memory/timeline?relationshipId=${rel._id}&emotion=happy`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.body.memories.every((m) => m.emotionTag === "happy")).toBe(true);
  });
});

describe("PATCH /api/memory/:memoryId", () => {
  it("edits memory title", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const mem = await makeMemory(rel, a);
    const res = await request(app)
      .patch(`/api/memory/${mem._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ title: "Updated Title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
  });
});

describe("DELETE /api/memory/:memoryId", () => {
  it("soft deletes memory", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const mem = await makeMemory(rel, a);
    const res = await request(app)
      .delete(`/api/memory/${mem._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    const deleted = await Memory.findById(mem._id);
    expect(deleted.deleted).toBe(true);
  });
});

describe("POST /api/memory/:memoryId/pin", () => {
  it("toggles pin state", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const mem = await makeMemory(rel, a);
    const res = await request(app)
      .post(`/api/memory/${mem._id}/pin`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.pinned).toBe(true);
  });
});

describe("POST /api/memory/:memoryId/react", () => {
  it("adds reaction to memory", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const mem = await makeMemory(rel, a);
    const res = await request(app)
      .post(`/api/memory/${mem._id}/react`)
      .set("Authorization", `Bearer ${makeToken(b)}`)
      .send({ emoji: "❤️" });
    expect(res.status).toBe(200);
    expect(res.body.reactions).toHaveLength(1);
  });
});

describe("POST /api/memory/:memoryId/comment", () => {
  it("adds comment to memory", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const mem = await makeMemory(rel, a);
    const res = await request(app)
      .post(`/api/memory/${mem._id}/comment`)
      .set("Authorization", `Bearer ${makeToken(b)}`)
      .send({ text: "Beautiful memory!" });
    expect(res.status).toBe(201);
    expect(res.body.comments).toHaveLength(1);
  });

  it("rejects empty comment", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const mem = await makeMemory(rel, a);
    const res = await request(app)
      .post(`/api/memory/${mem._id}/comment`)
      .set("Authorization", `Bearer ${makeToken(b)}`)
      .send({ text: "" });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/memory/search", () => {
  it("finds memories by title", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await makeMemory(rel, a, { title: "Beach vacation" });
    await makeMemory(rel, a, { title: "Study session" });
    const res = await request(app)
      .get(`/api/memory/search?relationshipId=${rel._id}&q=beach`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.memories).toHaveLength(1);
  });

  // Regression test: special regex characters in the search query used to be
  // passed straight into MongoDB's $regex unescaped, which is both a ReDoS
  // vector (catastrophic backtracking on patterns like "(a+)+$") and a source
  // of unexpected 500s when a query happens to be invalid regex syntax (e.g.
  // an unbalanced parenthesis). The fix escapes regex metacharacters so the
  // query is always treated as literal text — this must not throw or hang.
  it("treats special regex characters as literal text and does not error", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await makeMemory(rel, a, { title: "Our (first) date!" });

    const literalRes = await request(app)
      .get(`/api/memory/search?relationshipId=${rel._id}&q=${encodeURIComponent("(first)")}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(literalRes.status).toBe(200);
    expect(literalRes.body.memories).toHaveLength(1);

    // A pathological backtracking pattern must resolve quickly, not hang
    const malformedRes = await request(app)
      .get(`/api/memory/search?relationshipId=${rel._id}&q=${encodeURIComponent("(a+)+$")}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(malformedRes.status).toBe(200);
    expect(malformedRes.body.memories).toHaveLength(0);
  });
});
