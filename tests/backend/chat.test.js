import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import chatRouter from "../../modules/chat/chat.routes.js";
import Message from "../../modules/chat/message.model.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/chat", chatRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe("GET /api/chat/messages/:relationshipId", () => {
  it("returns messages for relationship member", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await Message.create({ relationshipId: rel._id, senderId: a._id, type: "text", content: "hello", status: "sent" });

    const res = await request(app)
      .get(`/api/chat/messages/${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
    expect(res.body.messages[0].content).toBe("hello");
  });

  it("blocks non-member from reading messages", async () => {
    const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .get(`/api/chat/messages/${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(c)}`);
    expect(res.status).toBe(403);
  });

  it("returns empty array when no messages", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .get(`/api/chat/messages/${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(0);
  });

  it("paginates with limit", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        Message.create({ relationshipId: rel._id, senderId: a._id, type: "text", content: `msg ${i}`, status: "sent" })
      )
    );
    const res = await request(app)
      .get(`/api/chat/messages/${rel._id}?limit=3`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.body.messages).toHaveLength(3);
    expect(res.body.nextCursor).toBeDefined();
  });

  it("blocks access when relationship is not active", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b, "ended");
    const res = await request(app)
      .get(`/api/chat/messages/${rel._id}`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/chat/search/:relationshipId", () => {
  it("finds messages matching query", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    await Message.create({ relationshipId: rel._id, senderId: a._id, type: "text", content: "birthday party", status: "sent" });
    await Message.create({ relationshipId: rel._id, senderId: a._id, type: "text", content: "random text", status: "sent" });

    const res = await request(app)
      .get(`/api/chat/search/${rel._id}?q=birthday`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
  });

  it("returns 422 for empty query", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const res = await request(app)
      .get(`/api/chat/search/${rel._id}?q=`)
      .set("Authorization", `Bearer ${makeToken(a)}`);
    expect(res.status).toBe(422);
  });
});
