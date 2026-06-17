import { decodeJwt } from "jose";
import { NextRequest, NextResponse } from "next/server";

import {
  clearAuthCookies,
  refreshAccessToken,
  setAccessTokenCookie,
} from "@/lib/auth-tokens";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login"];

function tokenIsExpired(token?: string): boolean {
  if (!token) {
    return true;
  }

  try {
    const payload = decodeJwt(token);

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  let accessToken = request.cookies.get("access_token")?.value;

  const refreshToken = request.cookies.get("refresh_token")?.value;

  let refreshedAccessToken: string | null = null;

  if (tokenIsExpired(accessToken) && refreshToken) {
    // console.log("🔄 Access token expired, attempting to refresh...");
    const refreshed = await refreshAccessToken(refreshToken);

    if (refreshed) {
      accessToken = refreshed.access;
      refreshedAccessToken = refreshed.access;

      // Makes the refreshed token available to the current request.
      request.cookies.set("access_token", refreshed.access);
    }
  }

  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "redirect",
      `${pathname}${request.nextUrl.search}`,
    );

    const response = NextResponse.redirect(loginUrl);

    clearAuthCookies(response);

    return response;
  }

  if (isAuthRoute && accessToken) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    if (refreshedAccessToken) {
      setAccessTokenCookie(response, refreshedAccessToken);
    }

    return response;
  }

  const requestHeaders = new Headers(request.headers);

  // Pass modified cookies to the Server Components in this request.
  requestHeaders.set("cookie", request.cookies.toString());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (refreshedAccessToken) {
    setAccessTokenCookie(response, refreshedAccessToken);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
