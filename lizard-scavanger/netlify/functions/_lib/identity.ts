export function slugify(raw: string): string | null {
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length < 3 || s.length > 20) return null;
  return s;
}
