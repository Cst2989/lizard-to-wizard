import { withObservability } from "./_lib/observe.js";
import { deriveKey } from "./_lib/keys.js";
import { ok, methodNotAllowed, tooManyRequests } from "./_lib/http.js";
import { inboxStore } from "./_lib/blobs.js";
import {
  checkRateLimit,
  netlifyBlobRateLimitStore,
} from "./_lib/ratelimit.js";
import { Sentry } from "./_lib/sentry.js";

// POST /api/trigger-alert?attendee=<name>
// Emits a Sentry event tagged scavenger_alert=true AND writes the inbox
// directly. On AWS Lambda, any setTimeout-deferred work is killed after
// the response, so we cannot simulate the webhook round-trip server-side.
// In a real deployment, the Sentry alert rule's webhook path (see
// sentry-webhook.ts) does the same write — so the teaching still holds.
export const handler = withObservability("trigger-alert", async (event, obs) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const rl = await checkRateLimit(
    netlifyBlobRateLimitStore(),
    `alert:${obs.attendee}`,
    3,
  );
  if (!rl.allowed) return tooManyRequests();

  Sentry.withScope((scope) => {
    scope.setTag("scavenger_alert", "true");
    scope.setTag("attendee", obs.attendee);
    scope.setLevel("warning");
    Sentry.captureMessage("scavenger alert triggered");
  });

  const bonusKey = deriveKey(obs.attendee, 6);
  const message = {
    from: "alerts",
    subject: "🎉 final key",
    body:
      "Congrats! You've reached the end of the hunt.\n\n" +
      `Hidden bonus level: /level/6/${bonusKey}`,
    ts: new Date().toISOString(),
  };

  const existing =
    ((await inboxStore().get(obs.attendee, { type: "json" })) as {
      messages: unknown[];
    } | null) ?? { messages: [] };
  existing.messages.push(message);
  await inboxStore().setJSON(obs.attendee, existing);

  await obs.log("alert_triggered_and_delivered");
  return ok({
    ok: true,
    message: `alert emitted — check your inbox at /inbox/${obs.attendee}`,
  });
});
