import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  // console.log("Token:", token);

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  console.log(`${process.env.NEXT_PUBLIC_API_URL}/account/me/`);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await res.json();
    // console.log("User:", user);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
