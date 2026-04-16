import * as Sentry from "@sentry/react";

let initialized = false;

export function initClientSentry(): void {
  if (initialized) return;
  initialized = true;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    // Deliberately NO browser tracing — for the workshop we want the trace
    // shown in Sentry for each level to contain ONLY the backend span with
    // the key attribute, not 18 browser pageload spans that drown it out.
    // We still capture unhandled client errors (Issues) and the ErrorBoundary
    // works for level 6's breadcrumb story.
    integrations: [],
    tracesSampleRate: 0,
    environment: import.meta.env.MODE,
  });
}

export function tagAttendee(name: string | null): void {
  if (!name) return;
  Sentry.setUser({ username: name });
  Sentry.setTag("attendee", name);
}

export { Sentry };
