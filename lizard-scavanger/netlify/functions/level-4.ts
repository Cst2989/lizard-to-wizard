import { withObservability } from "./_lib/observe.js";
import { deriveKey, validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";
import { axiomDashboardUrl } from "./_lib/deeplinks.js";
import { logToAxiom } from "./_lib/axiom.js";

const LEVEL = 4;

export const handler = withObservability("level-4", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 4");
  }

  // Level 5 uses a 6-digit numeric key. Emit it to Axiom as a `metric`
  // sample so the attendee can find their value on the workshop dashboard.
  const nextKey = deriveKey(obs.attendee, LEVEL + 1, "digits");

  await logToAxiom({
    kind: "metric",
    metric: "lucky_number",
    value: Number(nextKey),
    attendee: obs.attendee,
    level: LEVEL,
    trace_id: obs.traceId,
  });

  await obs.log("level_4_metric_emitted", { value: nextKey });

  return ok({
    ok: true,
    traceId: obs.traceId,
    axiomDashboardUrl: axiomDashboardUrl(),
    hint:
      "Open the workshop Axiom dashboard. The 'lucky number' widget shows " +
      "one row per attendee. Find your row (`attendee == " +
      `"${obs.attendee}"`.replace(/`/g, "'") +
      "`) and read the value. That 6-digit number is the level 5 key.",
  });
});
