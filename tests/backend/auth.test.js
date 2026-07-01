import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeToken } from "../helpers/factories.js";
import authRouter from "../../modules/auth/auth.routes.js";
import { globalErrorHandler } from "../../services/api/src/middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use(globalErrorHandler);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const VALID = { email: "alice@test.com", password: "Password1", displayName: "Alice" };

describe("POST /api/auth/signup", () => {
  it("creates user and returns token", async () => {
    const res = await request(app).post("/api/auth/signup").send(VALID);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(VALID.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/signup").send(VALID);
    const res = await request(app).post("/api/auth/signup").send(VALID);
    expect(res.status).toBe(409);
  });

  it("rejects missing displayName", async () => {
    const res = await request(app).post("/api/auth/signup").send({ email: VALID.email, password: VALID.password });
    expect(res.status).toBe(422);
  });

  it("rejects weak password", async () => {
    const res = await request(app).post("/api/auth/signup").send({ ...VALID, password: "short" });
    expect(res.status).toBe(422);
  });

  it("rejects invalid email format", async () => {
    const res = await request(app).post("/api/auth/signup").send({ ...VALID, email: "not-an-email" });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/auth/login", () => {
  it("returns token on valid credentials", async () => {
    await request(app).post("/api/auth/signup").send(VALID);
    const res = await request(app).post("/api/auth/login").send({ email: VALID.email, password: VALID.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects wrong password", async () => {
    await request(app).post("/api/auth/signup").send(VALID);
    const res = await request(app).post("/api/auth/login").send({ email: VALID.email, password: "WrongPass1" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "ghost@test.com", password: "Password1" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns profile with valid token", async () => {
    const user = await makeUser();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${makeToken(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  it("rejects missing token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects invalid token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer bad.token.here");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/auth/profile", () => {
  it("updates displayName", async () => {
    const user = await makeUser();
    const res = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", `Bearer ${makeToken(user)}`)
      .send({ displayName: "Updated Name" });
    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe("Updated Name");
  });

  it("ignores disallowed fields", async () => {
    const user = await makeUser();
    const res = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", `Bearer ${makeToken(user)}`)
      .send({ passwordHash: "hacked", displayName: "Safe" });
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
