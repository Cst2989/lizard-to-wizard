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
  const url = event.rawUrl ?? "/api/level-2";

  // Emit an nginx-style access log and an app log. Include the full path
  // (with query string) so attendees can filter nginx logs by their name —
  // exactly like a real access log records ?user_id= or ?tenant=.
  const parsed = new URL(url, "http://x");
  const pathWithQuery = parsed.pathname + parsed.search;
  await logToAxiom({
    kind: "nginx",
    attendee: obs.attendee,
    level: LEVEL,
    trace_id: obs.traceId,
    method: event.httpMethod,
    path: pathWithQuery,
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

  const dataset = process.env.AXIOM_DATASET || "scavenger-prod";
  return ok({
    ok: true,
    traceId: obs.traceId,
    axiomLogsUrl: axiomLogsUrl(),
    hint:
      `Two queries. Two log kinds. One trace_id joins them.\n\n` +
      `STEP 1 — narrow to YOUR nginx log (gets you the trace_id, NOT the key):\n\n` +
      `  ['${dataset}'] | where kind == "nginx" and attendee == "${obs.attendee}"\n\n` +
      `Copy the \`trace_id\` field from the result row.\n\n` +
      `STEP 2 — pivot to the app log for that same request:\n\n` +
      `  ['${dataset}'] | where trace_id == "<paste-trace-id-here>"\n\n` +
      `Two rows come back. The 'app' row's \`msg\` field reads 'L3 key: <KEY>'.`,
  });
});
