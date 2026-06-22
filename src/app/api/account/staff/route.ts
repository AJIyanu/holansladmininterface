import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  refreshAccessToken,
  setAccessTokenCookie,
  clearAuthCookies,
} from "@/lib/auth-tokens";

async function createStaff(accessToken: string, payload: unknown) {
  return fetch(`${process.env.DJANGO_API_URL}/account/profiles/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Auth-Token": `Bearer ${accessToken}`,
      "User-Agent": "Mozilla/5.0 (VercelApp)",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

function extractFirstError(data: Record<string, unknown>): string {
  const firstValue = Object.values(data)[0];

  if (Array.isArray(firstValue)) {
    const item = firstValue[0];
    // e.g. { user: { username: ["error"] } }
    if (typeof item === "object" && item !== null) {
      return (
        Object.values(item as Record<string, string[]>)[0]?.[0] ??
        "An unexpected error occurred."
      );
    }
    // e.g. { phone_number: ["error"] }
    return String(item) ?? "An unexpected error occurred.";
  }

  // e.g. { user: { username: ["error"] } }
  if (typeof firstValue === "object" && firstValue !== null) {
    return extractFirstError(firstValue as Record<string, unknown>);
  }

  return "An unexpected error occurred.";
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  let accessToken = cookieStore.get("access_token")?.value;

  const refreshToken = cookieStore.get("refresh_token")?.value;

  const payload = await request.json();

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { detail: "Authentication required." },
      { status: 401 },
    );
  }

  let djangoResponse = accessToken
    ? await createStaff(accessToken, payload)
    : null;

  const shouldRefresh =
    !djangoResponse ||
    djangoResponse.status === 401 ||
    djangoResponse.status === 403;

  let refreshedAccessToken: string | null = null;

  if (shouldRefresh && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);

    if (refreshed?.access) {
      refreshedAccessToken = refreshed.access;
      accessToken = refreshed.access;

      djangoResponse = await createStaff(refreshed.access, payload);
    }
  }

  if (!djangoResponse || !accessToken) {
    const response = NextResponse.json(
      { detail: "Your session has expired. Please sign in again." },
      { status: 401 },
    );

    clearAuthCookies(response);

    return response;
  }
  const contentType = djangoResponse.headers.get("content-type");

  let data = contentType?.includes("application/json")
    ? await djangoResponse.json()
    : { detail: await djangoResponse.text() };

  // console.log(
  //   !djangoResponse.ok,
  //   typeof data === "object",
  //   !("detail" in data),
  //   data,
  // );
  if (!djangoResponse.ok && typeof data === "object" && !("detail" in data)) {
    data = { detail: extractFirstError(data) };
  }

  const response = NextResponse.json(data, {
    status: djangoResponse.status,
  });

  if (refreshedAccessToken) {
    setAccessTokenCookie(response, refreshedAccessToken);
  }

  return response;
}
