async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const res = await fetch(path, init);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: (body as { error?: string })?.error ?? res.statusText,
    };
  }
  return { ok: true, data: body as T };
}

export function register(name: string) {
  return request<{ attendee: string; level1Url: string }>("/api/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export type LevelResponse = {
  ok: boolean;
  traceId?: string;
  sentryTraceUrl?: string | null;
  axiomLogsUrl?: string | null;
  axiomDashboardUrl?: string | null;
  hint: string;
};

export function hitLevel(n: number, attendee: string, key: string) {
  const qs = new URLSearchParams({ attendee, key, level: String(n) });
  return request<LevelResponse>(`/api/level-${n}?${qs}`);
}

export function triggerAlert(attendee: string) {
  const qs = new URLSearchParams({ attendee });
  return request<{ ok: boolean; message: string }>(
    `/api/trigger-alert?${qs}`,
    { method: "POST" },
  );
}

export function getInbox(attendee: string) {
  const qs = new URLSearchParams({ attendee });
  return request<{
    attendee: string;
    messages: Array<{ from: string; subject: string; body: string; ts: string }>;
  }>(`/api/inbox?${qs}`);
}

export function resetAttendee(name: string) {
  return request<{ ok: boolean }>("/api/reset", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
}
