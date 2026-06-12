import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.DJANGO_API_URL || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Call Django login endpoint
    const res = await fetch(`${API_BASE_URL}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { success: false, error: error.detail },
        { status: 400 },
      );
    }

    const data = await res.json();

    // Create response
    const response = NextResponse.json(
      { success: true, user: data.user },
      { status: 200 },
    );

    // Set cookies directly
    response.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 3,
      path: "/",
    });
    response.cookies.set("refresh_token", data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
