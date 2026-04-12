const API_BASE = '/api';

export async function getConfig() {
  const res = await fetch(`${API_BASE}/admin/config`);
  return res.json();
}

export async function setConfig(page: string, variant: string) {
  const res = await fetch(`${API_BASE}/admin/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, variant }),
  });
  return res.json();
}

export async function resetConfig() {
  const res = await fetch(`${API_BASE}/admin/reset`, { method: 'POST' });
  return res.json();
}

export async function getPagePreview(page: string) {
  const res = await fetch(`${API_BASE}/pages/${page}`);
  return res.json();
}

export function connectSSE(onEvent: (data: any) => void): EventSource {
  const source = new EventSource(`${API_BASE}/events`);
  source.addEventListener('CONFIG_CHANGED', (e) => onEvent(JSON.parse((e as MessageEvent).data)));
  source.addEventListener('CONFIG_RESET', (e) => onEvent(JSON.parse((e as MessageEvent).data)));
  return source;
}
