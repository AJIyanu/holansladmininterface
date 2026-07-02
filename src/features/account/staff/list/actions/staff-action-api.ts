export async function staffActionApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  const payload = contentType?.includes("application/json")
    ? await response.json()
    : {
        detail: await response.text(),
      };

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      payload?.error ||
      "The requested action could not be completed.";

    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }

  return payload as T;
}
