import { NextRequest, NextResponse } from "next/server";

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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
      // Cache for 1 hour (3600 seconds)
      next: {
        revalidate: 3600,
        tags: [`user-${token.slice(-8)}`], // Use last 8 chars of token as cache tag
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
          // Set cache headers for browser/CDN caching
          "Cache-Control": "private, max-age=3600, stale-while-revalidate=300", // 1 hour cache, 5min stale
          Vary: "Cookie", // Cache varies by cookie (token)
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
