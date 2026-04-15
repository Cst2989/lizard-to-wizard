import { withObservability } from "./_lib/observe.js";
import { validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";

const LEVEL = 5;

// Landing endpoint for level 5: validates the key and describes the puzzle.
// The actual "emit alert" action is POST /api/trigger-alert.
export const handler = withObservability("level-5", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 5");
  }

  await obs.log("level_5_visited");
  return ok({
    ok: true,
    hint:
      "Hit POST /api/trigger-alert. That emits a Sentry event. A " +
      "pre-configured alert rule fires, its webhook writes to your inbox " +
      "in ~20 seconds. Open /inbox/" +
      obs.attendee +
      " and wait for the key.",
  });
});
