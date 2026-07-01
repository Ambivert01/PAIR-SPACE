import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import {
  startOfDay, endOfDay, daysAgo, weeksAgo, monthsAgo,
  formatDuration, timeAgo, daysBetween, isPast, isFuture,
} from "../../shared/utils/dateHelpers.js";
import {
  buildPaginationQuery, buildSort, getNextCursor, parseLimit, paginate,
} from "../../shared/utils/paginationHelper.js";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeRelationship } from "../helpers/factories.js";
import { verifyRelationshipMember, getPartnerId } from "../../shared/utils/relationshipValidator.js";

// ── dateHelpers ────────────────────────────────────────────────────────────
describe("dateHelpers", () => {
  describe("startOfDay / endOfDay", () => {
    it("startOfDay sets time to 00:00:00.000", () => {
      const d = startOfDay(new Date("2024-06-15T14:30:00Z"));
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
    });

    it("endOfDay sets time to 23:59:59.999", () => {
      const d = endOfDay(new Date("2024-06-15T14:30:00Z"));
      expect(d.getHours()).toBe(23);
      expect(d.getMinutes()).toBe(59);
      expect(d.getMilliseconds()).toBe(999);
    });
  });

  describe("daysAgo / weeksAgo / monthsAgo", () => {
    it("daysAgo returns date n days in the past", () => {
      const d = daysAgo(7);
      expect(Date.now() - d.getTime()).toBeGreaterThanOrEqual(7 * 86400000 - 1000);
    });

    it("weeksAgo returns date n weeks in the past", () => {
      const d = weeksAgo(2);
      expect(Date.now() - d.getTime()).toBeGreaterThanOrEqual(14 * 86400000 - 1000);
    });

    it("monthsAgo returns date n months in the past", () => {
      const d = monthsAgo(1);
      expect(Date.now() - d.getTime()).toBeGreaterThanOrEqual(29 * 86400000);
    });
  });

  describe("formatDuration", () => {
    it("formats seconds only", () => expect(formatDuration(45)).toBe("45s"));
    it("formats minutes and seconds", () => expect(formatDuration(125)).toBe("2m 5s"));
    it("formats hours and minutes", () => expect(formatDuration(3661)).toBe("1h 1m"));
    it("handles 0", () => expect(formatDuration(0)).toBe("0s"));
    it("handles null/undefined", () => expect(formatDuration(null)).toBe("0s"));
  });

  describe("timeAgo", () => {
    it("returns 'just now' for recent time", () => {
      expect(timeAgo(new Date())).toBe("just now");
    });

    it("returns minutes ago", () => {
      expect(timeAgo(new Date(Date.now() - 5 * 60 * 1000))).toBe("5m ago");
    });

    it("returns hours ago", () => {
      expect(timeAgo(new Date(Date.now() - 3 * 3600 * 1000))).toBe("3h ago");
    });

    it("returns days ago", () => {
      expect(timeAgo(new Date(Date.now() - 2 * 86400 * 1000))).toBe("2d ago");
    });
  });

  describe("daysBetween", () => {
    it("calculates days between two dates", () => {
      const a = new Date("2024-01-01");
      const b = new Date("2024-01-11");
      expect(daysBetween(a, b)).toBe(10);
    });

    it("returns 0 for same date", () => {
      const d = new Date();
      expect(daysBetween(d, d)).toBe(0);
    });
  });

  describe("isPast / isFuture", () => {
    it("isPast returns true for past date", () => {
      expect(isPast(new Date("2000-01-01"))).toBe(true);
    });

    it("isFuture returns true for future date", () => {
      expect(isFuture(new Date("2099-01-01"))).toBe(true);
    });

    it("isPast returns false for future date", () => {
      expect(isPast(new Date("2099-01-01"))).toBe(false);
    });
  });
});

// ── paginationHelper ───────────────────────────────────────────────────────
describe("paginationHelper", () => {
  describe("buildPaginationQuery", () => {
    it("returns base query when no cursor", () => {
      const q = buildPaginationQuery({ a: 1 }, null);
      expect(q).toEqual({ a: 1 });
    });

    it("adds $lt for desc direction", () => {
      const cursor = new Date("2024-06-01").toISOString();
      const q = buildPaginationQuery({}, cursor, "createdAt", "desc");
      expect(q.createdAt.$lt).toBeDefined();
    });

    it("adds $gt for asc direction", () => {
      const cursor = new Date("2024-06-01").toISOString();
      const q = buildPaginationQuery({}, cursor, "createdAt", "asc");
      expect(q.createdAt.$gt).toBeDefined();
    });
  });

  describe("buildSort", () => {
    it("returns -1 for desc", () => expect(buildSort("createdAt", "desc")).toEqual({ createdAt: -1 }));
    it("returns 1 for asc", () => expect(buildSort("createdAt", "asc")).toEqual({ createdAt: 1 }));
  });

  describe("getNextCursor", () => {
    it("returns null when fewer items than limit", () => {
      const items = [{ createdAt: new Date() }];
      expect(getNextCursor(items, 20)).toBeNull();
    });

    it("returns ISO string when items equal limit", () => {
      const d = new Date();
      const items = Array.from({ length: 20 }, () => ({ createdAt: d }));
      const cursor = getNextCursor(items, 20);
      expect(typeof cursor).toBe("string");
    });
  });

  describe("parseLimit", () => {
    it("returns default for NaN", () => expect(parseLimit("abc")).toBe(20));
    it("clamps to max", () => expect(parseLimit("200", 50)).toBe(50));
    it("returns parsed value", () => expect(parseLimit("15")).toBe(15));
    it("returns default for 0", () => expect(parseLimit("0")).toBe(20));
  });

  describe("paginate", () => {
    it("returns limit, sort, cursorFilter", () => {
      const result = paginate({ limit: "10", sortDir: "asc" });
      expect(result.limit).toBe(10);
      expect(result.sort.createdAt).toBe(1);
      expect(result.cursorFilter).toEqual({});
    });
  });
});

// ── relationshipValidator ──────────────────────────────────────────────────
describe("relationshipValidator", () => {
  beforeAll(connectTestDB);
  afterEach(clearTestDB);
  afterAll(closeTestDB);

  describe("verifyRelationshipMember", () => {
    it("returns relationship for valid member", async () => {
      const [a, b] = await Promise.all([makeUser(), makeUser()]);
      const rel = await makeRelationship(a, b, "active");
      const result = await verifyRelationshipMember(rel._id, a._id.toString());
      expect(result).not.toBeNull();
    });

    it("returns null for non-member", async () => {
      const [a, b, c] = await Promise.all([makeUser(), makeUser(), makeUser()]);
      const rel = await makeRelationship(a, b, "active");
      const result = await verifyRelationshipMember(rel._id, c._id.toString());
      expect(result).toBeNull();
    });

    it("returns null for inactive relationship when requireActive=true", async () => {
      const [a, b] = await Promise.all([makeUser(), makeUser()]);
      const rel = await makeRelationship(a, b, "ended");
      const result = await verifyRelationshipMember(rel._id, a._id.toString());
      expect(result).toBeNull();
    });

    it("returns relationship for inactive when requireActive=false", async () => {
      const [a, b] = await Promise.all([makeUser(), makeUser()]);
      const rel = await makeRelationship(a, b, "ended");
      const result = await verifyRelationshipMember(rel._id, a._id.toString(), { requireActive: false });
      expect(result).not.toBeNull();
    });

    it("returns null for missing inputs", async () => {
      expect(await verifyRelationshipMember(null, "someId")).toBeNull();
      expect(await verifyRelationshipMember("someId", null)).toBeNull();
    });
  });

  describe("getPartnerId", () => {
    it("returns partner id for user1", async () => {
      const [a, b] = await Promise.all([makeUser(), makeUser()]);
      const rel = await makeRelationship(a, b);
      expect(getPartnerId(rel, a._id.toString())).toBe(b._id.toString());
    });

    it("returns partner id for user2", async () => {
      const [a, b] = await Promise.all([makeUser(), makeUser()]);
      const rel = await makeRelationship(a, b);
      expect(getPartnerId(rel, b._id.toString())).toBe(a._id.toString());
    });

    it("returns null for null relationship", () => {
      expect(getPartnerId(null, "id")).toBeNull();
    });
  });
});
