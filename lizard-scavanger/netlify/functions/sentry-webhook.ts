import { withObservability } from "./_lib/observe.js";
import { verifySentryWebhook } from "./_lib/webhook.js";
import { deriveKey } from "./_lib/keys.js";
import { ok, bad, methodNotAllowed } from "./_lib/http.js";
import { inboxStore } from "./_lib/blobs.js";

// Endpoint Sentry calls when the scavenger alert rule fires.
// Expects header `sentry-hook-signature` = HMAC-SHA256(body, SENTRY_WEBHOOK_SECRET).
export const handler = withObservability("sentry-webhook", async (event, obs) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const secret = process.env.SENTRY_WEBHOOK_SECRET;
  if (!secret) return bad("webhook secret not configured", 503);

  const sig =
    event.headers["sentry-hook-signature"] ||
    event.headers["Sentry-Hook-Signature"];
  const body = event.body || "";
  if (!verifySentryWebhook(body, sig, secret))
    return bad("invalid signature", 401);

  let payload: { data?: { event?: { tags?: Array<[string, string]> } } };
  try {
    payload = JSON.parse(body);
  } catch {
    return bad("invalid json");
  }

  const tags = payload?.data?.event?.tags ?? [];
  const attendee = tagValue(tags, "attendee");
  if (!attendee) return bad("no attendee tag on event");

  const bonusKey = deriveKey(attendee, 6);
  const message = {
    from: "sentry-webhook",
    subject: "🎉 final key (via webhook)",
    body:
      "Sentry alert fired; this message arrived via the webhook path.\n\n" +
      `Hidden bonus level: /level/6/${bonusKey}`,
    ts: new Date().toISOString(),
  };

  const existing =
    ((await inboxStore().get(attendee, { type: "json" })) as {
      messages: unknown[];
    } | null) ?? { messages: [] };
  existing.messages.push(message);
  await inboxStore().setJSON(attendee, existing);

  await obs.log("webhook_delivered", { attendee });
  return ok({ delivered: true });
});

function tagValue(
  tags: Array<[string, string]>,
  key: string,
): string | null {
  const hit = tags.find((t) => t[0] === key);
  return hit ? hit[1] : null;
}
