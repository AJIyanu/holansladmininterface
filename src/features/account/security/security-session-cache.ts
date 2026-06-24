const inFlightRequests = new Map<string, Promise<unknown>>();

export function readSecurityCache<T>(key: string): T | null {
  try {
    const value = window.sessionStorage.getItem(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore browser storage errors.
    }

    return null;
  }
}

export function writeSecurityCache<T>(key: string, value: T): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The page still works without session storage.
  }
}

export function removeSecurityCache(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore browser storage errors.
  }
}

interface FetchSessionCachedOptions {
  cacheKey: string;
  url: string;
  timeoutMs: number;
}

export function fetchSessionCached<T>({
  cacheKey,
  url,
  timeoutMs,
}: FetchSessionCachedOptions): Promise<T> {
  const cached = readSecurityCache<T>(cacheKey);

  if (cached) {
    return Promise.resolve(cached);
  }

  const existing = inFlightRequests.get(cacheKey);

  if (existing) {
    return existing as Promise<T>;
  }

  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const request = (async () => {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | T
      | {
          detail?: string;
        }
      | null;

    if (!response.ok) {
      const errorMessage =
        payload && typeof payload === "object" && "detail" in payload
          ? payload.detail
          : null;

      throw new Error(
        errorMessage || "The requested security information is unavailable.",
      );
    }

    if (!payload) {
      throw new Error("The server returned an empty response.");
    }

    writeSecurityCache(cacheKey, payload);

    return payload as T;
  })().finally(() => {
    window.clearTimeout(timeout);
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, request);

  return request;
}
