import { withObservability } from "./_lib/observe.js";
import { validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, bad, unauthorized } from "./_lib/http.js";

// GET /api/validate?attendee=X&level=N&key=Y
// Lightweight check used by the hunt UI to gate the "debrief" reveal
// without re-emitting the level's telemetry.
export const handler = withObservability("validate", async (event, obs) => {
  const params = event.queryStringParameters ?? {};
  const level = parseInt(params.level ?? "", 10);
  const key = params.key ?? "";
  if (!Number.isFinite(level) || level < 1) return bad("invalid level");

  const good = validateKey(obs.attendee, level, key, formatForLevel(level));
  if (!good) return unauthorized("wrong key");
  return ok({ ok: true });
});
