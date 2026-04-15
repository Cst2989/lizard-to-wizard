export function sentryTraceUrl(traceId: string): string | null {
  const org = process.env.SENTRY_ORG_SLUG;
  if (!org) return null;
  return `https://sentry.io/organizations/${org}/performance/trace/${traceId}/`;
}

export function axiomDashboardUrl(): string | null {
  return process.env.AXIOM_DASHBOARD_URL || null;
}

export function axiomLogsUrl(): string | null {
  const ds = process.env.AXIOM_DATASET;
  if (!ds) return null;
  return `https://app.axiom.co/datasets/${ds}`;
}
