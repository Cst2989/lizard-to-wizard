import type { Handler } from "@netlify/functions";
import { initSentry, Sentry } from "./_lib/sentry.js";

// GET /api/debug-sentry
// Creates a span (like the level handlers do) AND a message, flushes, and
// reports whether both landed.
export const handler: Handler = async () => {
  initSentry();
  const dsn = process.env.SENTRY_DSN ?? "";

  let traceId: string | undefined;
  let spanId: string | undefined;

  await Sentry.startSpan(
    {
      name: "debug.probe",
      op: "function",
      attributes: { probe: "true", ts: Date.now() },
    },
    async (span) => {
      traceId = span?.spanContext().traceId;
      spanId = span?.spanContext().spanId;
      span?.setAttribute("debug_next_key", "ABCD1234");
      // Simulate a little work so duration isn't 0
      await new Promise((r) => setTimeout(r, 50));
    },
  );

  // Also send a plain message for belt+suspenders
  const messageId = Sentry.captureMessage(
    `debug.probe message ${new Date().toISOString()}`,
    "info",
  );

  let flushed = false;
  try {
    flushed = await Sentry.flush(5000);
  } catch {
    /* */
  }

  const client = Sentry.getClient();

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "x-trace-id": traceId ?? "none",
    },
    body: JSON.stringify(
      {
        dsnPresent: !!dsn,
        dsnHost: dsn ? new URL(dsn).host : null,
        hasClient: !!client,
        tracesSampleRate: client?.getOptions().tracesSampleRate,
        traceId,
        spanId,
        messageId,
        flushed,
        note:
          "If traceId is set and flushed=true, wait 30s and search Sentry Explore → Traces for traceId.",
      },
      null,
      2,
    ),
  };
};
