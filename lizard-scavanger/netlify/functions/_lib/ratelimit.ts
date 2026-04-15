export type RateLimitRecord = { hits: number[] };

export type RateLimitStore = {
  get(key: string): Promise<RateLimitRecord | null>;
  set(key: string, value: RateLimitRecord): Promise<void>;
};

export async function checkRateLimit(
  store: RateLimitStore,
  key: string,
  maxPerMinute: number,
  now: number = Date.now(),
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = 60_000;
  const record = (await store.get(key)) ?? { hits: [] };
  const recent = record.hits.filter((ts) => now - ts < windowMs);
  if (recent.length >= maxPerMinute) {
    return { allowed: false, remaining: 0 };
  }
  recent.push(now);
  await store.set(key, { hits: recent });
  return { allowed: true, remaining: maxPerMinute - recent.length };
}

export function netlifyBlobRateLimitStore(): RateLimitStore {
  return {
    async get(k) {
      const { ratelimitStore } = await import("./blobs.js");
      return (await ratelimitStore().get(k, { type: "json" })) as RateLimitRecord | null;
    },
    async set(k, v) {
      const { ratelimitStore } = await import("./blobs.js");
      await ratelimitStore().setJSON(k, v);
    },
  };
}
