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

    return (await Sentry.startSpan(
      {
        name,
        op: "function",
        attributes: { attendee, level: levelParam ?? -1 },
      },
      async (span) => {
        const traceId =
          span?.spanContext().traceId ?? randomBytes(16).toString("hex");
        Sentry.setTag("attendee", attendee);
        if (levelParam !== undefined) Sentry.setTag("level", String(levelParam));

        const setSpanAttribute = (k: string, v: string | number | boolean) => {
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

        try {
          await log("handler_start");
          const result = await inner(
            event,
            { attendee, level: levelParam, traceId, log, setSpanAttribute },
            context,
          );
          await log("handler_end", { status: result.statusCode });
          return result;
        } catch (err) {
          Sentry.captureException(err);
          await log("handler_error", { error: String(err) });
          // Re-emit to stderr so `netlify dev` shows the trace during local
          // development; in production Sentry is the source of truth.
          console.error(`[${name}]`, err);
          return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              error: "internal",
              message: err instanceof Error ? err.message : String(err),
            }),
          };
        }
      },
    )) as ObservedResponse;
  };
}
