export function sentryTraceUrl(traceId: string): string | null {
  const org = process.env.SENTRY_ORG_SLUG;
  if (!org) return null;
  return `https://${org}.sentry.io/explore/traces/trace/${traceId}/`;
}

export function axiomDashboardUrl(): string | null {
  return process.env.AXIOM_DASHBOARD_URL || null;
}

export function axiomLogsUrl(): string | null {
  return process.env.AXIOM_LOGS_URL || null;
}
