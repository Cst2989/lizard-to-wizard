import { tagAttendee } from "./sentry";

const KEY = "attendee_name";

export function getAttendee(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAttendee(name: string): void {
  try {
    localStorage.setItem(KEY, name);
  } catch {
    /* private mode, etc. */
  }
  tagAttendee(name);
}

export function clearAttendee(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  tagAttendee(null);
}

export function validateNameInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return "name too short (min 3)";
  if (trimmed.length > 20) return "name too long (max 20)";
  if (!/^[a-zA-Z0-9 \-_.]+$/.test(trimmed))
    return "use letters, digits, space, or hyphen";
  return null;
}
