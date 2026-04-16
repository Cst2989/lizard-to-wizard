import type { ObservedResponse } from "./observe.js";

// Disable every cache we can reach: browser, Netlify Edge, Netlify Durable,
// any upstream proxy. Scavenger endpoints are side-effectful (emit telemetry,
// write blobs, fire alerts) and MUST run for every request.
const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store, max-age=0, must-revalidate",
  "netlify-cdn-cache-control": "no-store",
  pragma: "no-cache",
};

export const ok = (body: unknown): ObservedResponse => ({
  statusCode: 200,
  headers: JSON_HEADERS,
  body: JSON.stringify(body),
});

export const bad = (msg: string, status = 400): ObservedResponse => ({
  statusCode: status,
  headers: JSON_HEADERS,
  body: JSON.stringify({ error: msg }),
});

export const unauthorized = (msg: string): ObservedResponse => bad(msg, 401);
export const methodNotAllowed = (): ObservedResponse => bad("method not allowed", 405);
export const tooManyRequests = (): ObservedResponse =>
  bad("slow down — too many requests", 429);
