import type { ObservedResponse } from "./observe.js";

const JSON_HEADERS = { "content-type": "application/json" };

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
