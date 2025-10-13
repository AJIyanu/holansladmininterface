import { cookies } from "next/headers";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";

  // Server-side
  if (process.env.NEXT_PUBLIC_BASE_URL)
    return `${process.env.NEXT_PUBLIC_BASE_URL}`;

  return "http://localhost:3000";
}

export async function getCurrentUser() {
  try {
    const cookie = (await cookies()).toString();

    const res = await fetch(`${getBaseUrl()}/api/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}
