import { cookies } from "next/headers";

import { refreshAccessToken, type RefreshResponse } from "@/lib/auth-tokens";

type ServerFetchOptions = RequestInit & {
  auth?: boolean;
};

interface DjangoTokenError {
  code?: string;
  detail?: string;
  messages?: Array<{
    token_class?: string;
    token_type?: string;
    message?: string;
  }>;
}

export class ServerFetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = "ServerFetchError";
  }
}

function buildHeaders(
  originalHeaders: HeadersInit | undefined,
  token?: string,
): Headers {
  const headers = new Headers(originalHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  /*
   * Do not automatically add Content-Type to FormData requests.
   * The browser/fetch implementation must add the multipart boundary.
   */
  if (!headers.has("Content-Type") && originalHeaders !== undefined) {
    // Preserve an explicitly supplied Content-Type.
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);

    headers.set("X-Auth-Token", `Bearer ${token}`);

    headers.set("User-Agent", "Mozilla/5.0 (VercelApp)");
  }

  return headers;
}

function shouldSetJsonContentType(
  body: BodyInit | null | undefined,
  headers: Headers,
): boolean {
  if (!body || headers.has("Content-Type")) {
    return false;
  }

  return typeof body === "string";
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function isTokenFailure(response: Response, body: unknown): boolean {
  if (response.status === 401) {
    return true;
  }

  if (response.status !== 403) {
    return false;
  }

  if (!body || typeof body !== "object") {
    return false;
  }

  const error = body as DjangoTokenError;

  if (error.code === "token_not_valid") {
    return true;
  }

  if (error.detail?.toLowerCase().includes("token")) {
    return true;
  }

  return (
    error.messages?.some((message) => {
      const text = message.message?.toLowerCase() ?? "";

      return text.includes("expired") || text.includes("invalid");
    }) ?? false
  );
}

/*
 * Cookie writes work when serverFetch is running under a Route
 * Handler or Server Action. They are not permitted during Server
 * Component rendering, so failure to persist is safely ignored there.
 *
 * Proxy remains the main mechanism for refreshing and persisting
 * tokens before protected requests.
 */
async function tryPersistRefreshedTokens(
  tokens: RefreshResponse,
): Promise<void> {
  try {
    const cookieStore = await cookies();

    cookieStore.set("access_token", tokens.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    if (tokens.refresh) {
      cookieStore.set("refresh_token", tokens.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch {
    /*
     * Expected when called while rendering a Server Component.
     * The retry still succeeds for this request, while Proxy handles
     * normal persistence on protected page/API requests.
     */
  }
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { auth = true, headers: suppliedHeaders, ...requestOptions } = options;

  const apiUrl = process.env.DJANGO_API_URL;

  if (!apiUrl) {
    throw new Error("DJANGO_API_URL is not configured.");
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;

  const refreshToken = cookieStore.get("refresh_token")?.value;

  const url = new URL(path, apiUrl);

  const makeRequest = async (token?: string): Promise<Response> => {
    const headers = buildHeaders(suppliedHeaders, auth ? token : undefined);

    if (shouldSetJsonContentType(requestOptions.body, headers)) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(url, {
      ...requestOptions,
      headers,
      cache: "no-store",
    });
  };

  /*
   * Attempt 1: use the current access token.
   */
  let response = await makeRequest(accessToken);
  let responseBody = await readResponseBody(response);

  if (response.ok) {
    return responseBody as T;
  }

  /*
   * Only refresh for authenticated requests with an actual
   * access-token authentication failure.
   */
  if (!auth || !isTokenFailure(response, responseBody)) {
    throw new ServerFetchError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      responseBody,
    );
  }

  if (!refreshToken) {
    throw new ServerFetchError(
      "Authentication session has expired.",
      401,
      responseBody,
    );
  }

  /*
   * Refresh exactly once.
   */
  const refreshedTokens = await refreshAccessToken(refreshToken);

  if (!refreshedTokens?.access) {
    throw new ServerFetchError(
      "Unable to refresh authentication session.",
      401,
      responseBody,
    );
  }

  await tryPersistRefreshedTokens(refreshedTokens);

  /*
   * Attempt 2: retry exactly once using the new access token.
   */
  response = await makeRequest(refreshedTokens.access);

  responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new ServerFetchError(
      `Request failed after token refresh: ${response.status} ${response.statusText}`,
      response.status,
      responseBody,
    );
  }

  return responseBody as T;
}
