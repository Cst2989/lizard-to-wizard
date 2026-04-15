import { createHmac } from "node:crypto";

const SECRET = () => process.env.WORKSHOP_SECRET || "dev-secret-change-me";

export type KeyFormat = "hex" | "digits";

export function deriveKey(attendee: string, level: number, format: KeyFormat = "hex"): string {
  const hmac = createHmac("sha256", SECRET());
  hmac.update(`${attendee}:${level}`);
  const digest = hmac.digest();
  if (format === "digits") {
    const n = digest.readUInt32BE(0) % 1_000_000;
    return n.toString().padStart(6, "0");
  }
  return digest.toString("hex").slice(0, 8).toUpperCase();
}

export function validateKey(
  attendee: string,
  level: number,
  key: string,
  format: KeyFormat = "hex",
): boolean {
  const expected = deriveKey(attendee, level, format);
  return expected === key.toUpperCase();
}

// Level 5 uses numeric keys (they come from a metric value on a dashboard).
export const KEY_FORMAT_BY_LEVEL: Record<number, KeyFormat> = {
  1: "hex",
  2: "hex",
  3: "hex",
  4: "hex",
  5: "digits",
  6: "hex",
};

export function formatForLevel(level: number): KeyFormat {
  return KEY_FORMAT_BY_LEVEL[level] ?? "hex";
}
