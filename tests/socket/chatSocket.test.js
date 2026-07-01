import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import initChatSocket from "../../modules/chat/chat.socket.js";

let httpServer, ioServer, port;

const connect = (token) =>
  new Promise((resolve) => {
    const socket = Client(`http://localhost:${port}/chat`, {
      auth: { token },
      transports: ["websocket"],
    });
    socket.on("connect", () => resolve(socket));
  });

const waitFor = (socket, event) =>
  new Promise((resolve) => socket.once(event, resolve));

beforeAll(async () => {
  await connectTestDB();
  httpServer = createServer();
  ioServer = new Server(httpServer);
  initChatSocket(ioServer);
  await new Promise((r) => httpServer.listen(0, r));
  port = httpServer.address().port;
});

afterEach(clearTestDB);

afterAll(async () => {
  ioServer.close();
  await new Promise((r) => httpServer.close(r));
  await closeTestDB();
});

describe("Chat socket", () => {
  it("rejects connection without token", (done) => {
    const socket = Client(`http://localhost:${port}/chat`, {
      auth: {},
      transports: ["websocket"],
    });
    socket.on("connect_error", (err) => {
      expect(err.message).toMatch(/token/i);
      socket.disconnect();
      done();
    });
  });

  it("connects with valid token", async () => {
    const user = await makeUser();
    const socket = await connect(makeToken(user));
    expect(socket.connected).toBe(true);
    socket.disconnect();
  });

  it("joins relationship room and receives room_joined", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const socket = await connect(makeToken(a));

    const joined = waitFor(socket, "room_joined");
    socket.emit("join_relationship_room", { relationshipId: rel._id.toString() });
    const data = await joined;

    expect(data.relationshipId).toBe(rel._id.toString());
    socket.disconnect();
  });

  it("sends and receives message between two users", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const [sockA, sockB] = await Promise.all([connect(makeToken(a)), connect(makeToken(b))]);

    await Promise.all([
      new Promise((r) => { sockA.emit("join_relationship_room", { relationshipId: relId }); sockA.once("room_joined", r); }),
      new Promise((r) => { sockB.emit("join_relationship_room", { relationshipId: relId }); sockB.once("room_joined", r); }),
    ]);

    const received = waitFor(sockB, "receive_message");
    sockA.emit("send_message", { relationshipId: relId, content: "Hello!", type: "text" });
    const msg = await received;

    expect(msg.content).toBe("Hello!");
    expect(msg.type).toBe("text");

    sockA.disconnect();
    sockB.disconnect();
  });

  it("broadcasts typing_start to partner", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const [sockA, sockB] = await Promise.all([connect(makeToken(a)), connect(makeToken(b))]);

    await Promise.all([
      new Promise((r) => { sockA.emit("join_relationship_room", { relationshipId: relId }); sockA.once("room_joined", r); }),
      new Promise((r) => { sockB.emit("join_relationship_room", { relationshipId: relId }); sockB.once("room_joined", r); }),
    ]);

    const typing = waitFor(sockB, "typing_start");
    sockA.emit("typing_start", { relationshipId: relId });
    const data = await typing;

    expect(data.userId).toBe(a._id.toString());
    sockA.disconnect();
    sockB.disconnect();
  });

  it("rejects message longer than 2000 chars", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const sockA = await connect(makeToken(a));
    await new Promise((r) => { sockA.emit("join_relationship_room", { relationshipId: relId }); sockA.once("room_joined", r); });

    const err = waitFor(sockA, "error");
    sockA.emit("send_message", { relationshipId: relId, content: "x".repeat(2001), type: "text" });
    const data = await err;

    expect(data.message).toMatch(/long/i);
    sockA.disconnect();
  });

  it("emits message_deleted after delete event", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const [sockA, sockB] = await Promise.all([connect(makeToken(a)), connect(makeToken(b))]);
    await Promise.all([
      new Promise((r) => { sockA.emit("join_relationship_room", { relationshipId: relId }); sockA.once("room_joined", r); }),
      new Promise((r) => { sockB.emit("join_relationship_room", { relationshipId: relId }); sockB.once("room_joined", r); }),
    ]);

    // send a message first
    const received = waitFor(sockB, "receive_message");
    sockA.emit("send_message", { relationshipId: relId, content: "delete me", type: "text" });
    const msg = await received;

    // delete it
    const deleted = waitFor(sockB, "message_deleted");
    sockA.emit("message_delete", { messageId: msg._id, relationshipId: relId });
    const del = await deleted;

    expect(del.messageId).toBe(msg._id);
    sockA.disconnect();
    sockB.disconnect();
  });
});
