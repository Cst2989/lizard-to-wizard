import { withObservability } from "./_lib/observe.js";
import { deriveKey, validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";
import { sentryTraceUrl } from "./_lib/deeplinks.js";
import { Sentry } from "./_lib/sentry.js";

const LEVEL = 3;

export const handler = withObservability("level-3", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 3");
  }

  const nextKey = deriveKey(obs.attendee, LEVEL + 1);
  // Split 8-char hex key into 3 fragments: 3 + 3 + 2
  const fragA = nextKey.slice(0, 3);
  const fragB = nextKey.slice(3, 6);
  const fragC = nextKey.slice(6, 8);

  obs.setSpanAttribute("key_fragment_1", fragA);

  await Sentry.startSpan(
    { name: "enqueue", op: "queue.publish" },
    async (span) => {
      span?.setAttribute("attendee", obs.attendee);
      span?.setAttribute("key_fragment_2", fragB);
      await sleep(120);
    },
  );

  await Sentry.startSpan(
    { name: "worker", op: "queue.process" },
    async (span) => {
      span?.setAttribute("attendee", obs.attendee);
      span?.setAttribute("key_fragment_3", fragC);
      // Simulate work completing a short time later.
      await sleep(600);
    },
  );

  await obs.log("level_3_completed", {
    parts: 3,
  });

  return ok({
    ok: true,
    traceId: obs.traceId,
    sentryTraceUrl: sentryTraceUrl(obs.traceId),
    hint:
      "Open the trace in Sentry. The root span carries `key_fragment_1`; " +
      "an 'enqueue' child span carries `key_fragment_2`; a 'worker' child " +
      "span carries `key_fragment_3`. Concatenate them (in order) to form " +
      "the 8-char key.",
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
