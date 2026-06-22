import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  clearAuthCookies,
  refreshAccessToken,
  setAccessTokenCookie,
} from "@/lib/auth-tokens";

type AuthenticatedFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export interface AuthenticatedFetchResult {
  response: Response | null;
  accessToken?: string;
  errorResponse?: NextResponse;
}

function createAuthHeaders(
  accessToken: string,
  headers?: HeadersInit,
): Headers {
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Authorization", `Bearer ${accessToken}`);

  // Required fallback because the normal Authorization header
  // is stripped before reaching Django on Render.
  requestHeaders.set("X-Auth-Token", `Bearer ${accessToken}`);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  return requestHeaders;
}

async function makeRequest(
  path: string,
  accessToken: string,
  options: AuthenticatedFetchOptions,
): Promise<Response> {
  return fetch(`${process.env.DJANGO_API_URL}${path}`, {
    ...options,
    headers: createAuthHeaders(accessToken, options.headers),
    cache: options.cache ?? "no-store",
  });
}

async function tokenHasExpired(response: Response): Promise<boolean> {
  if (response.status !== 401 && response.status !== 403) {
    return false;
  }

  try {
    const data = await response.clone().json();

    return (
      data?.code === "token_not_valid" ||
      data?.messages?.some((message: { message?: string }) =>
        message.message?.toLowerCase().includes("expired"),
      )
    );
  } catch {
    return response.status === 401;
  }
}

export async function authenticatedRouteFetch(
  path: string,
  options: AuthenticatedFetchOptions = {},
): Promise<AuthenticatedFetchResult> {
  const cookieStore = await cookies();

  let accessToken = cookieStore.get("access_token")?.value;

  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return {
      response: null,
      errorResponse: NextResponse.json(
        {
          detail: "Authentication required.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  let djangoResponse: Response | null = null;

  if (accessToken) {
    djangoResponse = await makeRequest(path, accessToken, options);
  }

  const shouldRefresh =
    !djangoResponse || (await tokenHasExpired(djangoResponse));

  if (shouldRefresh && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);

    if (!refreshed?.access) {
      const errorResponse = NextResponse.json(
        {
          detail: "Your session has expired. Please sign in again.",
        },
        {
          status: 401,
        },
      );

      clearAuthCookies(errorResponse);

      return {
        response: null,
        errorResponse,
      };
    }

    accessToken = refreshed.access;

    djangoResponse = await makeRequest(path, accessToken, options);

    return {
      response: djangoResponse,
      accessToken,
    };
  }

  return {
    response: djangoResponse,
  };
}

export function createAuthenticatedResponse(
  data: unknown,
  status: number,
  accessToken?: string,
): NextResponse {
  const response = NextResponse.json(data, {
    status,
  });

  if (accessToken) {
    setAccessTokenCookie(response, accessToken);
  }

  return response;
}
