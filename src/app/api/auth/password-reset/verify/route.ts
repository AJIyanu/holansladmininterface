import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const response = await fetch(
      `${process.env.DJANGO_API_URL}/account/password-reset/verify/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Password reset verify failed:", error);

    return NextResponse.json(
      {
        detail: "Unable to verify reset link.",
        valid: false,
      },
      {
        status: 500,
      },
    );
  }
}
