import { withObservability } from "./_lib/observe.js";
import { slugify } from "./_lib/identity.js";
import { deriveKey } from "./_lib/keys.js";
import { namesStore } from "./_lib/blobs.js";
import { ok, bad, methodNotAllowed } from "./_lib/http.js";

export const handler = withObservability("register", async (event, obs) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const { name } = safeJson(event.body);
  if (!name || typeof name !== "string")
    return bad("field 'name' is required");

  const base = slugify(name);
  if (!base)
    return bad("name must be 3–20 chars of a–z, 0–9, hyphen");

  const store = namesStore();
  let attendee = base;
  let suffix = 1;
  while (await store.get(attendee)) {
    suffix += 1;
    attendee = `${base}-${suffix}`;
    if (suffix > 99) return bad("name space exhausted — try another");
  }
  await store.set(attendee, new Date().toISOString());

  await obs.log("attendee_registered", { attendee });

  const l1Key = deriveKey(attendee, 1);
  return ok({ attendee, level1Url: `/level/1/${l1Key}` });
});

function safeJson(body: string | null): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}
