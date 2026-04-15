import { withObservability } from "./_lib/observe.js";
import { deriveKey, validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";
import { sentryTraceUrl } from "./_lib/deeplinks.js";

const LEVEL = 1;

export const handler = withObservability("level-1", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 1");
  }

  const nextKey = deriveKey(obs.attendee, LEVEL + 1);
  obs.setSpanAttribute("next_key", nextKey);
  obs.setSpanAttribute("scavenger.level", LEVEL);
  await obs.log("level_1_visited", { next_key: nextKey });

  return ok({
    ok: true,
    traceId: obs.traceId,
    sentryTraceUrl: sentryTraceUrl(obs.traceId),
    hint:
      "Open Sentry → Traces. Search for this trace ID, expand the 'level-1' span, " +
      "and read the 'next_key' attribute.",
  });
});
