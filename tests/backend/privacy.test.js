import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import privacyRouter from "../../modules/privacy/privacy.routes.js";
import Message from "../../modules/chat/message.model.js";
import Memory from "../../modules/memory/memory.model.js";
import Relationship from "../../modules/relationship/relationship.model.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/privacy", privacyRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe("POST /api/privacy/incognito", () => {
  it("enables incognito mode", async () => {
    const a = await makeUser();
    const res = await request(app)
      .post("/api/privacy/incognito")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ enabled: true });
    expect(res.status).toBe(200);
    expect(res.body.incognito).toBe(true);
  });

  it("disables incognito mode", async () => {
    const a = await makeUser();
    const res = await request(app)
      .post("/api/privacy/incognito")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ enabled: false });
    expect(res.status).toBe(200);
    expect(res.body.incognito).toBe(false);
  });
});

describe("POST /api/privacy/block + unblock", () => {
  it("blocks partner and sets relationship to blocked", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .post("/api/privacy/block")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
    expect(res.body.blocked).toBe(true);
    const updated = await Relationship.findById(rel._id);
    expect(updated.status).toBe("blocked");
  });

  it("unblocks relationship", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "blocked");
    const res = await request(app)
      .post("/api/privacy/unblock")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
    expect(res.body.unblocked).toBe(true);
  });

  it("blocks non-member from blocking", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .post("/api/privacy/block")
      .set("Authorization", `Bearer ${makeToken(c)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/privacy/export", () => {
  it("exports relationship data for member", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    await Message.create({ relationshipId: rel._id, senderId: a._id, type: "text", content: "hi", status: "sent" });
    const res = await request(app)
      .get(`/api/privacy/export?relationshipId=${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.messages).toBeDefined();
    expect(res.body.memories).toBeDefined();
    expect(res.body.plans).toBeDefined();
  });

  it("blocks non-member from exporting", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .get(`/api/privacy/export?relationshipId=${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(c)}`);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/privacy/clear-chat", () => {
  it("clears chat history for member", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    await Message.create({ relationshipId: rel._id, senderId: a._id, type: "text", content: "secret", status: "sent" });
    const res = await request(app)
      .post("/api/privacy/clear-chat")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
    const msgs = await Message.find({ relationshipId: rel._id, deleted: false });
    expect(msgs).toHaveLength(0);
  });
});

describe("GET /api/privacy/sessions", () => {
  it("returns empty sessions list", async () => {
    const a = await makeUser();
    const res = await request(app)
      .get("/api/privacy/sessions")
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.sessions).toBeDefined();
  });
});

// Regression test: the Memory schema previously had no lockPin/lockedAt fields,
// so Mongoose's default strict mode silently dropped them on save — locking a
// memory appeared to succeed but the PIN was never actually persisted, meaning
// unlockMemory would always fail with "Memory is not locked". This test proves
// the full lock → persist → unlock round trip now genuinely works.
describe("POST /api/privacy/memories/:memoryId/lock + unlock", () => {
  it("persists the PIN hash and successfully unlocks with the correct PIN", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const memory = await Memory.create({
      relationshipId: rel._id,
      creatorId: a._id,
      type: "text_note",
      title: "Our secret",
      memoryDate: new Date(),
    });

    const lockRes = await request(app)
      .post(`/api/privacy/memories/${memory._id}/lock`)
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ pin: "1234" });
    expect(lockRes.status).toBe(200);
    expect(lockRes.body.locked).toBe(true);

    // Verify the PIN was actually written to the database, not silently dropped
    const persisted = await Memory.findById(memory._id).select("+lockPin");
    expect(persisted.lockPin).toBeTruthy();
    expect(persisted.lockedAt).toBeTruthy();
    expect(persisted.visibility).toBe("locked");

    // Wrong PIN must be rejected
    const wrongRes = await request(app)
      .post(`/api/privacy/memories/${memory._id}/unlock`)
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ pin: "9999" });
    expect(wrongRes.status).toBe(401);

    // Correct PIN must unlock successfully
    const unlockRes = await request(app)
      .post(`/api/privacy/memories/${memory._id}/unlock`)
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ pin: "1234" });
    expect(unlockRes.status).toBe(200);
    expect(unlockRes.body.unlocked).toBe(true);

    const afterUnlock = await Memory.findById(memory._id).select("+lockPin");
    expect(afterUnlock.lockPin).toBeFalsy();
    expect(afterUnlock.visibility).toBe("visible");
  });

  it("rejects locking by a non-member", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const memory = await Memory.create({
      relationshipId: rel._id, creatorId: a._id, type: "text_note",
      title: "Private", memoryDate: new Date(),
    });
    const res = await request(app)
      .post(`/api/privacy/memories/${memory._id}/lock`)
      .set("Authorization", `Bearer ${makeToken(c)}`)
      .send({ pin: "1234" });
    expect(res.status).toBe(403);
  });
});
