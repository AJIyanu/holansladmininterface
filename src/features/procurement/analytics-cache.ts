const inFlight = new Map<string, Promise<unknown>>();

export function removeAnalyticsCache(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Server caching remains authoritative when browser storage is unavailable.
  }
}

export function fetchAnalyticsCached<T>(
  key: string,
  url: string,
  timeoutMs: number,
) {
  try {
    const stored = window.sessionStorage.getItem(key);
    if (stored) return Promise.resolve(JSON.parse(stored) as T);
  } catch {
    removeAnalyticsCache(key);
  }
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const request = fetch(url, { cache: "no-store", signal: controller.signal })
    .then(async (response) => {
      const payload = (await response.json().catch(() => null)) as
        T | { detail?: string } | null;
      if (!response.ok)
        throw new Error(
          (payload && typeof payload === "object" && "detail" in payload
            ? payload.detail
            : null) || "Procurement analytics are temporarily unavailable.",
        );
      if (!payload) throw new Error("The analytics response was empty.");
      try {
        window.sessionStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // Continue with the backend-cached response.
      }
      return payload as T;
    })
    .finally(() => {
      window.clearTimeout(timeout);
      inFlight.delete(key);
    });
  inFlight.set(key, request);
  return request;
}
