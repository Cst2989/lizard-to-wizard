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
// Emits a Sentry event tagged scavenger_alert=true. In production the
// Sentry alert rule's webhook writes the inbox entry (see sentry-webhook.ts).
// For workshop reliability we ALSO write the inbox directly after a short
// delay so the hunt continues even if Sentry alerts aren't wired up yet.
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

  // Deliver via the fallback path ~20s later (simulates webhook round-trip).
  setTimeout(async () => {
    try {
      const existing =
        ((await inboxStore().get(obs.attendee, { type: "json" })) as {
          messages: unknown[];
        } | null) ?? { messages: [] };
      existing.messages.push(message);
      await inboxStore().setJSON(obs.attendee, existing);
    } catch (err) {
      console.warn("inbox fallback write failed", err);
    }
  }, 15_000);

  await obs.log("alert_triggered");
  return ok({
    ok: true,
    message:
      "alert emitted — check your inbox at /inbox/" + obs.attendee + " in ~20s",
  });
});
