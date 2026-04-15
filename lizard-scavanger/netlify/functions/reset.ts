import { withObservability } from "./_lib/observe.js";
import { ok, bad, methodNotAllowed } from "./_lib/http.js";
import {
  inboxStore,
  namesStore,
  progressStore,
  ratelimitStore,
} from "./_lib/blobs.js";
import { slugify } from "./_lib/identity.js";

// POST /api/reset { name }
// Wipes all server-side state for an attendee. Frontend wipes localStorage.
export const handler = withObservability("reset", async (event, obs) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();
  const { name } = safeJson(event.body);
  const attendee = slugify(String(name ?? ""));
  if (!attendee) return bad("name required");

  await Promise.all([
    namesStore().delete(attendee),
    inboxStore().delete(attendee),
    progressStore().delete(attendee),
    ratelimitStore().delete(`alert:${attendee}`),
    ratelimitStore().delete(attendee),
  ]);

  await obs.log("attendee_reset", { attendee });
  return ok({ ok: true });
});

function safeJson(body: string | null): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}
