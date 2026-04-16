import * as Sentry from "@sentry/react";

let initialized = false;

export function initClientSentry(): void {
  if (initialized) return;
  initialized = true;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    // Propagate trace headers to our own API so server-side spans link up.
    tracePropagationTargets: ["localhost", /^\//],
    environment: import.meta.env.MODE,
  });
}

export function tagAttendee(name: string | null): void {
  if (!name) return;
  Sentry.setUser({ username: name });
  Sentry.setTag("attendee", name);
}

export { Sentry };
