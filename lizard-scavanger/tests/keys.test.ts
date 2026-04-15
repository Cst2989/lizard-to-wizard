import { describe, expect, it } from "vitest";
import {
  deriveKey,
  validateKey,
  formatForLevel,
} from "../netlify/functions/_lib/keys";

describe("deriveKey", () => {
  it("is deterministic", () => {
    expect(deriveKey("alice", 1)).toBe(deriveKey("alice", 1));
  });
  it("differs by attendee", () => {
    expect(deriveKey("alice", 1)).not.toBe(deriveKey("bob", 1));
  });
  it("differs by level", () => {
    expect(deriveKey("alice", 1)).not.toBe(deriveKey("alice", 2));
  });
  it("hex format is 8 uppercase hex chars", () => {
    expect(deriveKey("alice", 1, "hex")).toMatch(/^[0-9A-F]{8}$/);
  });
  it("digits format is 6 digits", () => {
    expect(deriveKey("alice", 5, "digits")).toMatch(/^[0-9]{6}$/);
  });
});

describe("validateKey", () => {
  it("accepts correct key", () => {
    const k = deriveKey("alice", 3);
    expect(validateKey("alice", 3, k)).toBe(true);
  });
  it("rejects wrong key", () => {
    expect(validateKey("alice", 3, "DEADBEEF")).toBe(false);
  });
  it("accepts lowercase input (normalized to uppercase)", () => {
    const k = deriveKey("alice", 3).toLowerCase();
    expect(validateKey("alice", 3, k)).toBe(true);
  });
  it("validates digits-format keys", () => {
    const k = deriveKey("alice", 5, "digits");
    expect(validateKey("alice", 5, k, "digits")).toBe(true);
  });
});

describe("formatForLevel", () => {
  it("level 5 uses digits", () => {
    expect(formatForLevel(5)).toBe("digits");
  });
  it("other levels use hex", () => {
    expect(formatForLevel(1)).toBe("hex");
    expect(formatForLevel(99)).toBe("hex");
  });
});
