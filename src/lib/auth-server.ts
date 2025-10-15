import { cookies } from "next/headers";
import fetch from "node-fetch";

export const config = { runtime: "nodejs" };

function getBaseUrl() {
  if (typeof window !== "undefined") return "";

  // Server-side
  if (process.env.NEXT_PUBLIC_API_URL)
    return `${process.env.NEXT_PUBLIC_API_URL}`;

  return "http://localhost:3000";
}

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get("access_token");
    console.log("🍪 Access token from cookies:", token?.value);

    const res = await fetch(`${getBaseUrl()}/account/me`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token.value}` } : {}),
      },
      cache: "no-store",
    });

    console.log("📥 Response status:", res.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(res.headers.entries())
    );

    return await res.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}
