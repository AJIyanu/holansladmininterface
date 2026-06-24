export async function accountApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : {
        detail: await response.text(),
      };

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        "The requested action could not be completed.",
    );
  }

  return data as T;
}
