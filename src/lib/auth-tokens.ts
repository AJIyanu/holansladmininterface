// import { NextResponse } from "next/server";

// // import { env } from "@/lib/env";

// interface RefreshResponse {
//   access: string;
//   refresh?: string;
// }

// export async function refreshAccessToken(
//   refreshToken: string,
// ): Promise<RefreshResponse | null> {
//   try {
//     const response = await fetch(
//       `${process.env.DJANGO_API_URL}/token/refresh/`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           refresh: refreshToken,
//         }),
//         cache: "no-store",
//       },
//     );

//     if (!response.ok) {
//       return null;
//     }

//     const data = (await response.json()) as RefreshResponse;

//     return data.access ? data : null;
//   } catch {
//     return null;
//   }
// }

// export function setAccessTokenCookie(
//   response: NextResponse,
//   accessToken: string,
// ): void {
//   response.cookies.set("access_token", accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: 60 * 15,
//   });
// }

// export function clearAuthCookies(response: NextResponse): void {
//   response.cookies.delete("access_token");
//   response.cookies.delete("refresh_token");
// }

import type { NextResponse } from "next/server";

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponse | null> {
  if (!refreshToken) {
    return null;
  }

  const apiUrl = process.env.DJANGO_API_URL;

  if (!apiUrl) {
    throw new Error("DJANGO_API_URL is not configured.");
  }

  try {
    const response = await fetch(new URL("/token/refresh/", apiUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<RefreshResponse>;

    if (!data.access) {
      return null;
    }

    return {
      access: data.access,
      refresh: data.refresh,
    };
  } catch (error) {
    console.error("Token refresh failed:", error);

    return null;
  }
}

export function setAccessTokenCookie(
  response: NextResponse,
  accessToken: string,
): void {
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string,
): void {
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function setAuthCookies(
  response: NextResponse,
  tokens: RefreshResponse,
): void {
  setAccessTokenCookie(response, tokens.access);

  if (tokens.refresh) {
    setRefreshTokenCookie(response, tokens.refresh);
  }
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
