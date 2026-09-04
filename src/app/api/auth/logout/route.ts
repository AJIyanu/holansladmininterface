import { after, NextRequest, NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth-tokens";

const API_BASE_URL = process.env.DJANGO_API_URL || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (accessToken && refreshToken) {
    after(async () => {
      try {
        const backendResponse = await fetch(`${API_BASE_URL}/account/logout/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access: accessToken,
            refresh: refreshToken,
          }),
          cache: "no-store",
        });

        if (!backendResponse.ok) {
          console.error("Backend logout failed:", backendResponse.status);
        }
      } catch (error) {
        console.error("Backend logout request failed:", error);
      }
    });
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookies(response);

  return response;
}
