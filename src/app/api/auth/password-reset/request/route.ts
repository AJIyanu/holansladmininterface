import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (typeof email === "string" && email.trim()) {
      await fetch(
        `${process.env.DJANGO_API_URL}/account/password-reset/request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
          cache: "no-store",
        },
      );
    }
  } catch (error) {
    // Do not reveal whether the email exists or whether Django failed.
    console.error("Password reset request failed:", error);
  }

  return NextResponse.json({
    detail: "If the email exists in our records, a reset link will be sent.",
    code: "password_reset_request_received",
  });
}
