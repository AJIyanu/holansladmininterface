import { cookies } from "next/headers";
import type { CurrentUser } from "@/types/auth";
// import fetch from "node-fetch";

// export const config = { runtime: "nodejs" };

// function getBaseUrl() {
//   if (typeof window !== "undefined") return "";

//   // Server-side
//   if (process.env.DJANGO_API_URL) return `${process.env.DJANGO_API_URL}`;

//   return "http://localhost:3000";
// }

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.DJANGO_API_URL}/account/me/`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Auth-Token": `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CurrentUser;
  } catch (error) {
    console.error("Unable to fetch current user:", error);

    return null;
  }
}
