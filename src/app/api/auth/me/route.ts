import { NextRequest, NextResponse } from "next/server";

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // console.log(`${process.env.NEXT_PUBLIC_API_URL}/account/me/`);

  try {
    // Use Next.js built-in fetch caching with revalidate option
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },

      next: {
        revalidate: CACHE_DURATION,
        tags: [`user-${token.slice(-8)}`],
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await res.json();

    return NextResponse.json(
      { user },
      {
        headers: {
          "Cache-Control": "private, max-age=3600, stale-while-revalidate=300",
          Vary: "Cookie",
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
