import { cookies } from "next/headers";

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

    const res = await fetch(`${getBaseUrl()}/account/me`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    });

    const user = await res.json();

    return { user };
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}
