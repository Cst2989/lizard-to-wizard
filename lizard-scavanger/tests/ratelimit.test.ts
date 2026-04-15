import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  type RateLimitRecord,
  type RateLimitStore,
} from "../netlify/functions/_lib/ratelimit";

function makeStore(): RateLimitStore & { data: Map<string, RateLimitRecord> } {
  const data = new Map<string, RateLimitRecord>();
  return {
    data,
    async get(k) {
      return data.get(k) ?? null;
    },
    async set(k, v) {
      data.set(k, v);
    },
  };
}

describe("checkRateLimit", () => {
  it("allows first hit", async () => {
    const s = makeStore();
    const r = await checkRateLimit(s, "alice", 3, 1000);
    expect(r).toEqual({ allowed: true, remaining: 2 });
  });

  it("blocks after maxPerMinute within window", async () => {
    const s = makeStore();
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(s, "alice", 3, 1000 + i);
    }
    const r = await checkRateLimit(s, "alice", 3, 1005);
    expect(r.allowed).toBe(false);
  });

  it("expires hits outside the 60s window", async () => {
    const s = makeStore();
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(s, "alice", 3, 1000 + i);
    }
    // 61s later
    const r = await checkRateLimit(s, "alice", 3, 62_000);
    expect(r.allowed).toBe(true);
  });

  it("keys are independent", async () => {
    const s = makeStore();
    await checkRateLimit(s, "alice", 1, 1000);
    const r = await checkRateLimit(s, "bob", 1, 1000);
    expect(r.allowed).toBe(true);
  });
});
