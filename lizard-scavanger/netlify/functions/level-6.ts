import { withObservability } from "./_lib/observe.js";
import { deriveKey, validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";
import { Sentry } from "./_lib/sentry.js";

const LEVEL = 6;

// Bonus level: deliberately throw, with breadcrumbs that spell the next step
// in the workshop. The attendee finds the issue in Sentry Issues and reads
// the breadcrumbs.
export const handler = withObservability("level-6", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 6");
  }

  const congrats = `You beat the hunt, ${obs.attendee}! ${deriveKey(obs.attendee, 99)}`;
  Sentry.addBreadcrumb({
    category: "scavenger",
    level: "info",
    message: "preparing to fail",
    data: { attendee: obs.attendee, level: LEVEL },
  });
  Sentry.addBreadcrumb({
    category: "scavenger",
    level: "info",
    message: congrats,
  });
  Sentry.addBreadcrumb({
    category: "scavenger",
    level: "warning",
    message: "throwing now — find me in Sentry Issues",
  });

  // The wrapper will capture this and return 500, which is fine — the
  // teaching surface is the Sentry Issue with breadcrumbs.
  throw new Error(`lizard-scavenger bonus: ${obs.attendee}`);
  // (typescript) — unreachable but keeps types happy
  return ok({});
});
