// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const authRoutes = ["/login", "/register", "/forgot-password"];
const protectedRoutes = ["/dashboard"];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyJWT(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let token = request.cookies.get("access_token")?.value;

  let isAuthenticated = false;
  let resCookies: string | null = null;
  let nextResponse: NextResponse | null = null;

  if (token) {
    isAuthenticated = await verifyJWT(token);
  }
  console.log("Token valid:", isAuthenticated);

  // Try refresh if not authenticated but refresh token exists
  if (!isAuthenticated) {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      // call our refresh route
      const refreshRes = await fetch(
        new URL("/api/auth/refresh", request.url),
        {
          method: "POST",
          headers: {
            Cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (refreshRes.ok) {
        // Refresh worked — get new access token from response
        resCookies = refreshRes.headers.get("set-cookie");
      }
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated && !resCookies) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      nextResponse = NextResponse.redirect(loginUrl);
    }
    // return NextResponse.next();
  }

  // Handle auth routes
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated || resCookies) {
      nextResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // nextResponse =  NextResponse.next();
  }

  if (resCookies) {
    if (!nextResponse) {
      nextResponse = NextResponse.next();
    }
    nextResponse.headers.append("set-cookie", resCookies);
  }

  return nextResponse || NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
