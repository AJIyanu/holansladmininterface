import { decodeJwt } from "jose";
import { type NextRequest, NextResponse } from "next/server";

import {
  clearAuthCookies,
  refreshAccessToken,
  setAuthCookies,
} from "@/lib/auth-tokens";

const protectedPagePrefixes = ["/dashboard"];

function isAccessTokenExpired(token?: string, toleranceSeconds = 30): boolean {
  if (!token) {
    return true;
  }

  try {
    const payload = decodeJwt(token);

    if (!payload.exp) {
      return true;
    }

    const expiryTime = payload.exp * 1000;
    const tolerance = toleranceSeconds * 1000;

    return expiryTime <= Date.now() + tolerance;
  } catch {
    return true;
  }
}

function isProtectedPage(pathname: string): boolean {
  return protectedPagePrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isProtectedApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/");
}

function createLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set(
    "redirect",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  const response = NextResponse.redirect(loginUrl);

  clearAuthCookies(response);

  return response;
}

function createApiUnauthorisedResponse(): NextResponse {
  const response = NextResponse.json(
    {
      detail: "Your authentication session has expired.",
      code: "authentication_required",
    },
    {
      status: 401,
    },
  );

  clearAuthCookies(response);

  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  /*
   * This should also be excluded by the matcher, but keeping this
   * guard protects the route if the matcher changes later.
   */
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const protectedPage = isProtectedPage(pathname);
  const protectedApi = isProtectedApiRoute(pathname);
  const loginPage = pathname === "/login";

  const requiresAuthentication = protectedPage || protectedApi;

  let accessToken = request.cookies.get("access_token")?.value;

  const refreshToken = request.cookies.get("refresh_token")?.value;

  let refreshedTokens: Awaited<ReturnType<typeof refreshAccessToken>> | null =
    null;

  /*
   * Refresh when the access token is missing, expired, or within
   * 30 seconds of expiring.
   */
  if (refreshToken && isAccessTokenExpired(accessToken)) {
    refreshedTokens = await refreshAccessToken(refreshToken);

    if (refreshedTokens?.access) {
      accessToken = refreshedTokens.access;

      /*
       * Make refreshed tokens available to the Route Handler or
       * Server Component during this same request.
       */
      request.cookies.set("access_token", refreshedTokens.access);

      if (refreshedTokens.refresh) {
        request.cookies.set("refresh_token", refreshedTokens.refresh);
      }
    } else {
      accessToken = undefined;
    }
  }

  if (requiresAuthentication && !accessToken) {
    if (protectedApi) {
      return createApiUnauthorisedResponse();
    }

    return createLoginRedirect(request);
  }

  if (loginPage && accessToken) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    if (refreshedTokens) {
      setAuthCookies(response, refreshedTokens);
    }

    return response;
  }

  /*
   * Forward the modified cookies to the current request so that
   * cookies() and serverFetch() see the refreshed token immediately.
   */
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("cookie", request.cookies.toString());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  /*
   * Persist refreshed tokens in the browser for subsequent requests.
   */
  if (refreshedTokens) {
    setAuthCookies(response, refreshedTokens);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Runs for application pages and API routes, but excludes:
     * - /api/auth/*
     * - Next.js internal assets
     * - favicon
     * - public files containing an extension
     */
    "/((?!api/auth(?:/|$)|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
