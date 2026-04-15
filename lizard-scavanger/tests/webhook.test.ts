import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifySentryWebhook } from "../netlify/functions/_lib/webhook";

describe("verifySentryWebhook", () => {
  const secret = "test-secret";
  const body = '{"action":"triggered","data":{"alert_rule":"scavenger"}}';
  const goodSig = createHmac("sha256", secret).update(body).digest("hex");

  it("accepts a valid signature", () => {
    expect(verifySentryWebhook(body, goodSig, secret)).toBe(true);
  });
  it("rejects a tampered body", () => {
    expect(verifySentryWebhook(body + "x", goodSig, secret)).toBe(false);
  });
  it("rejects a missing signature", () => {
    expect(verifySentryWebhook(body, undefined, secret)).toBe(false);
  });
  it("rejects a malformed (non-hex) signature", () => {
    expect(verifySentryWebhook(body, "not-hex!", secret)).toBe(false);
  });
  it("rejects a signature of wrong length", () => {
    expect(verifySentryWebhook(body, "deadbeef", secret)).toBe(false);
  });
});
