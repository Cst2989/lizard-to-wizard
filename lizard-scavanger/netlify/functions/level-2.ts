import { withObservability } from "./_lib/observe.js";
import { deriveKey, validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";
import { axiomLogsUrl } from "./_lib/deeplinks.js";
import { logToAxiom } from "./_lib/axiom.js";

const LEVEL = 2;

export const handler = withObservability("level-2", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 2");
  }

  const nextKey = deriveKey(obs.attendee, LEVEL + 1);
  const url = event.rawUrl ?? "/level/2";

  // Emit an nginx-style access log and an app log. The app log is what
  // contains the next key — the attendee must find their trace id from the
  // nginx log, then search the trace id to land on the app log.
  await logToAxiom({
    kind: "nginx",
    attendee: obs.attendee,
    level: LEVEL,
    trace_id: obs.traceId,
    method: event.httpMethod,
    path: new URL(url, "http://x").pathname,
    status: 200,
    ua: event.headers["user-agent"] ?? "",
  });
  await logToAxiom({
    kind: "app",
    attendee: obs.attendee,
    level: LEVEL,
    trace_id: obs.traceId,
    msg: `L3 key: ${nextKey}`,
  });

  return ok({
    ok: true,
    traceId: obs.traceId,
    axiomLogsUrl: axiomLogsUrl(),
    hint:
      "In Axiom, filter your dataset for `kind == 'nginx'` and `attendee == " +
      `"${obs.attendee}"`.replace(/`/g, "'") +
      "`. Pick the log for this page hit, copy its `trace_id`, then search " +
      "logs again for that trace id to find an app log of the form " +
      "`L3 key: <key>`.",
  });
});
