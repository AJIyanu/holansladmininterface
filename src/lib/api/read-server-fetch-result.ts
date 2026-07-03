export interface ServerFetchResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

export async function readServerFetchResult<T>(
  result: Response | T,
): Promise<ServerFetchResult<T>> {
  if (result instanceof Response) {
    const text = await result.text();

    let data: T | null = null;

    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as T;
      }
    }

    return {
      ok: result.ok,
      status: result.status,
      data,
    };
  }

  return {
    ok: true,
    status: 200,
    data: result,
  };
}
