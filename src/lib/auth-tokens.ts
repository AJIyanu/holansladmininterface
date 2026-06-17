import { NextResponse } from "next/server";

// import { env } from "@/lib/env";

interface RefreshResponse {
  access: string;
  refresh?: string;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponse | null> {
  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RefreshResponse;

    return data.access ? data : null;
  } catch {
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
    maxAge: 60 * 15,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
}
