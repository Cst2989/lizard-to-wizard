import { withObservability } from "./_lib/observe.js";
import { deriveKey, validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";

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
    hint:
      "Grab the 'x-trace-id' from this response's headers (DevTools → " +
      "Network). Open Sentry → Explore → Traces. Two ways: (a) paste the " +
      "ID into the URL: https://neciudan.sentry.io/explore/traces/trace/" +
      "<YOUR_TRACE_ID>/ — or (b) in the search box, type attendee:" +
      obs.attendee +
      " to list all your traces. The search box does NOT accept a raw " +
      "trace ID. Click the 'scavenger.level-1' span to read the 'next_key' " +
      "attribute.",
  });
});
