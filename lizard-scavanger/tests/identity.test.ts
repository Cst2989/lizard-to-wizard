import { describe, expect, it } from "vitest";
import { slugify } from "../netlify/functions/_lib/identity";

describe("slugify", () => {
  it("lowercases", () => expect(slugify("Alice")).toBe("alice"));
  it("replaces spaces", () => expect(slugify("Alice Smith")).toBe("alice-smith"));
  it("strips punctuation", () =>
    expect(slugify("Alice!@#Smith")).toBe("alice-smith"));
  it("collapses multiple hyphens", () => expect(slugify("a---b")).toBe("a-b"));
  it("rejects too short", () => expect(slugify("ab")).toBeNull());
  it("rejects too long", () => expect(slugify("a".repeat(21))).toBeNull());
  it("trims edge hyphens", () => expect(slugify("-alice-")).toBe("alice"));
  it("keeps digits", () => expect(slugify("user42")).toBe("user42"));
});
