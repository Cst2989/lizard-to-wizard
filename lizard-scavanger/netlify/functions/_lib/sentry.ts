import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentry(): typeof Sentry {
  if (initialized) return Sentry;
  initialized = true;
  if (!process.env.SENTRY_DSN) return Sentry; // SDK becomes a no-op
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.CONTEXT || "dev",
    release: process.env.COMMIT_REF,
  });
  return Sentry;
}

export { Sentry };
