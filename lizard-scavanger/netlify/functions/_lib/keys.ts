import { createHmac } from "node:crypto";

const SECRET = () => process.env.WORKSHOP_SECRET || "dev-secret-change-me";

export type KeyFormat = "hex" | "digits";

export function deriveKey(attendee: string, level: number, format: KeyFormat = "hex"): string {
  const hmac = createHmac("sha256", SECRET());
  hmac.update(`${attendee}:${level}`);
  const digest = hmac.digest();
  if (format === "digits") {
    // 100000–999999: always 6 digits, no leading zeros so Number/String
    // round-tripping across the wire is safe.
    const n = 100_000 + (digest.readUInt32BE(0) % 900_000);
    return n.toString();
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
