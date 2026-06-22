import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const response = await fetch(
      `${process.env.DJANGO_API_URL}/account/password-reset/confirm/`,
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
    console.error("Password reset confirm failed:", error);

    return NextResponse.json(
      {
        detail: "Unable to reset password.",
      },
      {
        status: 500,
      },
    );
  }
}
