import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken, makeRelationship } from "../helpers/factories.js";
import initPresenceSocket from "../../modules/presence/presence.socket.js";
import { deletePresence } from "../../modules/presence/presence.store.js";

let httpServer, ioServer, port;

const connect = (token) =>
  new Promise((resolve) => {
    const socket = Client(`http://localhost:${port}/presence`, {
      auth: { token },
      transports: ["websocket"],
    });
    socket.on("connect", () => resolve(socket));
  });

const waitFor = (socket, event, timeout = 3000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeout);
    socket.once(event, (data) => { clearTimeout(t); resolve(data); });
  });

beforeAll(async () => {
  await connectTestDB();
  httpServer = createServer();
  ioServer = new Server(httpServer);
  initPresenceSocket(ioServer);
  await new Promise((r) => httpServer.listen(0, r));
  port = httpServer.address().port;
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  ioServer.close();
  await new Promise((r) => httpServer.close(r));
  await closeTestDB();
});

describe("Presence socket", () => {
  it("rejects connection without token", (done) => {
    const socket = Client(`http://localhost:${port}/presence`, {
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

  it("partner receives presence update on join", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const [sockA, sockB] = await Promise.all([connect(makeToken(a)), connect(makeToken(b))]);

    // B joins first
    sockB.emit("presence_join", { relId });
    await waitFor(sockB, "partner_presence_update");

    // A joins — B should get A's presence
    const partnerUpdate = waitFor(sockB, "partner_presence_update");
    sockA.emit("presence_join", { relId });
    const update = await partnerUpdate;

    expect(update.status).toBe("online");
    sockA.disconnect();
    sockB.disconnect();
  });

  it("manual status update broadcasts to partner", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const [sockA, sockB] = await Promise.all([connect(makeToken(a)), connect(makeToken(b))]);

    sockA.emit("presence_join", { relId });
    sockB.emit("presence_join", { relId });
    await Promise.all([waitFor(sockA, "partner_presence_update"), waitFor(sockB, "partner_presence_update")]);

    const update = waitFor(sockB, "partner_presence_update");
    sockA.emit("presence_update", { status: "busy" });
    const data = await update;

    expect(data.status).toBe("busy");
    sockA.disconnect();
    sockB.disconnect();
  });

  it("hidden visibility shows partner as offline", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);
    const relId = rel._id.toString();

    const [sockA, sockB] = await Promise.all([connect(makeToken(a)), connect(makeToken(b))]);

    sockA.emit("presence_join", { relId });
    sockB.emit("presence_join", { relId });
    await Promise.all([waitFor(sockA, "partner_presence_update"), waitFor(sockB, "partner_presence_update")]);

    const update = waitFor(sockB, "partner_presence_update");
    sockA.emit("presence_visibility_change", { visibility: "hidden" });
    const data = await update;

    expect(data.status).toBe("offline");
    sockA.disconnect();
    sockB.disconnect();
  });

  it("presence_ping responds with presence_pong", async () => {
    const [a, b] = await Promise.all([makeUser(), makeUser()]);
    const rel = await makeRelationship(a, b);

    const sockA = await connect(makeToken(a));
    sockA.emit("presence_join", { relId: rel._id.toString() });
    await waitFor(sockA, "partner_presence_update");

    const pong = waitFor(sockA, "presence_pong");
    sockA.emit("presence_ping");
    await pong;

    sockA.disconnect();
  });
});
