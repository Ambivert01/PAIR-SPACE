import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import relationshipRouter from "../../modules/relationship/relationship.routes.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";
import Message from "../../modules/chat/message.model.js";
import Memory from "../../modules/memory/memory.model.js";

const app = express();
app.use(express.json());
app.use("/api/relationship", relationshipRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe("POST /api/relationship/invite", () => {
  it("sends invite successfully", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const res = await request(app)
      .post("/api/relationship/invite")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ email: b.email, relationshipType: "couple" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  it("rejects self-invite", async () => {
    const a = await makeUser();
    const res = await request(app)
      .post("/api/relationship/invite")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ email: a.email });
    expect(res.status).toBe(400);
  });

  it("rejects invite to unknown email", async () => {
    const a = await makeUser();
    const res = await request(app)
      .post("/api/relationship/invite")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ email: "nobody@test.com" });
    expect(res.status).toBe(404);
  });

  it("rejects duplicate pending invite", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    await request(app)
      .post("/api/relationship/invite")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ email: b.email });
    const res = await request(app)
      .post("/api/relationship/invite")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ email: b.email });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/relationship/accept", () => {
  it("accepts pending invite", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "pending");
    const res = await request(app)
      .post("/api/relationship/accept")
      .set("Authorization", `Bearer ${makeToken(b)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("active");
  });

  it("rejects accept by wrong user", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "pending");
    const res = await request(app)
      .post("/api/relationship/accept")
      .set("Authorization", `Bearer ${makeToken(c)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(403);
  });
});

describe("POST /api/relationship/reject", () => {
  it("rejects pending invite", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "pending");
    const res = await request(app)
      .post("/api/relationship/reject")
      .set("Authorization", `Bearer ${makeToken(b)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/relationship/cancel", () => {
  it("cancels pending invite by inviter", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "pending");
    const res = await request(app)
      .post("/api/relationship/cancel")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/relationship/end", () => {
  it("ends active relationship", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .post("/api/relationship/end")
      .set("Authorization", `Bearer ${makeToken(a)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(200);
  });

  it("blocks non-member from ending", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .post("/api/relationship/end")
      .set("Authorization", `Bearer ${makeToken(c)}`)
      .send({ relationshipId: rel._id });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/relationship/my", () => {
  it("returns active relationship", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    await makeRelationship(a, b, "active");
    const res = await request(app)
      .get("/api/relationship/my")
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("active");
  });

  it("returns 404 when no relationship", async () => {
    const a = await makeUser();
    const res = await request(app)
      .get("/api/relationship/my")
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(404);
  });
});

describe("Relationship isolation", () => {
  it("user cannot access another user's relationship", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .get(`/api/relationship/${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(c)}`);
    expect(res.status).toBe(403);
  });
});

// Regression test: the dashboard previously hardcoded memories/messages stats
// to 0 with a "// Will be updated from API" comment that was never followed
// up — no endpoint existed to fetch real counts. This proves the new
// /:relationshipId/stats endpoint returns accurate, live counts.
describe("GET /api/relationship/:relationshipId/stats", () => {
  it("returns accurate message and memory counts", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");

    await Message.create([
      { relationshipId: rel._id, senderId: a._id, type: "text", content: "hi", status: "sent" },
      { relationshipId: rel._id, senderId: b._id, type: "text", content: "hey", status: "sent" },
      { relationshipId: rel._id, senderId: a._id, type: "text", content: "deleted one", status: "sent", deleted: true },
    ]);
    await Memory.create([
      { relationshipId: rel._id, creatorId: a._id, type: "text_note", title: "M1", memoryDate: new Date() },
      { relationshipId: rel._id, creatorId: b._id, type: "text_note", title: "M2", memoryDate: new Date() },
    ]);

    const res = await request(app)
      .get(`/api/relationship/${rel._id}/stats`)
      .set("Authorization", `Bearer ${makeToken(a)}`);

    expect(res.status).toBe(200);
    expect(res.body.messageCount).toBe(2); // deleted message excluded
    expect(res.body.memoryCount).toBe(2);
    expect(typeof res.body.daysTogether).toBe("number");
  });

  it("blocks non-members from viewing stats", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "active");
    const res = await request(app)
      .get(`/api/relationship/${rel._id}/stats`)
      .set("Authorization", `Bearer ${makeToken(c)}`);
    expect(res.status).toBe(403);
  });
});
