import { withObservability } from "./_lib/observe.js";
import { validateKey, formatForLevel } from "./_lib/keys.js";
import { ok, unauthorized } from "./_lib/http.js";
import { Sentry } from "./_lib/sentry.js";

const LEVEL = 6;

// Bonus level: captures a deliberate exception (without crashing the
// response) so the attendee can find it in Sentry Issues and read the
// breadcrumbs. The handler returns 200 so the UI can guide them onward.
export const handler = withObservability("level-6", async (event, obs) => {
  const key = event.queryStringParameters?.key ?? "";
  if (!validateKey(obs.attendee, LEVEL, key, formatForLevel(LEVEL))) {
    return unauthorized("wrong key for level 6");
  }

  const congrats = `You beat the hunt, ${obs.attendee}!`;
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
    message: "captureException about to fire — find me in Sentry Issues",
  });

  Sentry.withScope((scope) => {
    scope.setTag("scavenger_bonus", "true");
    scope.setTag("attendee", obs.attendee);
    scope.setLevel("warning");
    Sentry.captureException(
      new Error(`lizard-scavenger bonus finale: ${obs.attendee}`),
    );
  });

  await obs.log("level_6_completed");
  return ok({
    ok: true,
    hint:
      "Open Sentry → Issues. Find 'lizard-scavenger bonus finale' tagged " +
      `attendee=${obs.attendee}. Scroll the breadcrumbs — one of them is ` +
      "the congratulations you've earned.",
  });
});
