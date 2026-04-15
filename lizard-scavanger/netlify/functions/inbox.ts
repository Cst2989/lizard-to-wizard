import { withObservability } from "./_lib/observe.js";
import { ok, bad } from "./_lib/http.js";
import { inboxStore } from "./_lib/blobs.js";
import { slugify } from "./_lib/identity.js";

// GET /api/inbox?attendee=<name>
export const handler = withObservability("inbox", async (event, obs) => {
  const raw = event.queryStringParameters?.attendee ?? "";
  const name = slugify(raw);
  if (!name) return bad("invalid name");

  // Authorisation: the requester must be the same attendee (best effort —
  // this is a workshop, not a bank). We trust the query param matches obs.
  if (obs.attendee !== name) {
    await obs.log("inbox_cross_read", { requested: name });
    // Don't block, just log — attendees might legitimately view peers for demo.
  }

  const data =
    ((await inboxStore().get(name, { type: "json" })) as {
      messages: unknown[];
    } | null) ?? { messages: [] };

  return ok({ attendee: name, messages: data.messages });
});
