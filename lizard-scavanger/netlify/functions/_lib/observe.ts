import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import { Sentry, initSentry } from "./sentry.js";
import { logToAxiom } from "./axiom.js";
import { slugify } from "./identity.js";

export type ObservedContext = {
  attendee: string;
  level: number | undefined;
  traceId: string;
  log: (msg: string, extra?: Record<string, unknown>) => Promise<void>;
  setSpanAttribute: (key: string, value: string | number | boolean) => void;
};

export type ObservedResponse = {
  statusCode: number;
  body?: string;
  headers?: Record<string, string>;
};

type Inner = (
  event: HandlerEvent,
  obs: ObservedContext,
  ctx: HandlerContext,
) => Promise<ObservedResponse>;

export function withObservability(name: string, inner: Inner): Handler {
  return async (event, context) => {
    initSentry();
    const params = event.queryStringParameters ?? {};
    const attendee = slugify(params.attendee || "anon") || "anon";
    const levelParam = params.level ? parseInt(params.level, 10) : undefined;

    // Build inside the span callback, then flush AFTER it returns so the
    // span is actually ended and queued before we force the transport to
    // drain. If flush runs inside the callback, the root span is still open,
    // never gets sent, and Sentry silently loses it.
    const finalResponse = (await Sentry.startSpan(
      {
        name: `scavenger.${name}`,
        op: "function",
        attributes: { attendee, level: levelParam ?? -1 },
      },
      async (span) => {
        const traceId =
          span?.spanContext().traceId ?? randomBytes(16).toString("hex");
        Sentry.setTag("attendee", attendee);
        if (levelParam !== undefined) Sentry.setTag("level", String(levelParam));

        const setSpanAttribute = (
          k: string,
          v: string | number | boolean,
        ) => {
          span?.setAttribute(k, v);
        };

        const log = (msg: string, extra: Record<string, unknown> = {}) =>
          logToAxiom({
            msg,
            attendee,
            level: levelParam,
            trace_id: traceId,
            fn: name,
            ...extra,
          });

        let response: ObservedResponse;
        try {
          await log("handler_start");
          response = await inner(
            event,
            { attendee, level: levelParam, traceId, log, setSpanAttribute },
            context,
          );
          await log("handler_end", { status: response.statusCode });
        } catch (err) {
          Sentry.captureException(err);
          await log("handler_error", { error: String(err) });
          console.error(`[${name}]`, err);
          response = {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              error: "internal",
              message: err instanceof Error ? err.message : String(err),
            }),
          };
        }
        // Attach the trace ID and attendee as headers so attendees can see
        // them without inspecting the body.
        return {
          ...response,
          headers: {
            "cache-control": "no-store, max-age=0, must-revalidate",
            "netlify-cdn-cache-control": "no-store",
            pragma: "no-cache",
            ...(response.headers ?? {}),
            "x-trace-id": traceId,
            "x-attendee": attendee,
          },
        } as ObservedResponse;
      },
    )) as ObservedResponse;

    // Span has now ended (startSpan auto-ends when the callback resolves).
    // Flush so the envelope actually ships before the Lambda container freezes.
    try {
      await Sentry.flush(2000);
    } catch {
      /* best effort */
    }

    return finalResponse;
  };
}
