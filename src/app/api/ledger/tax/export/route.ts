import { NextRequest, NextResponse } from "next/server";
import { authenticatedRouteFetch } from "@/lib/authenticated-route-fetch";
import { setAccessTokenCookie } from "@/lib/auth-tokens";
export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["date_from", "date_to", "currency", "tax_type", "party"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  try {
    const result = await authenticatedRouteFetch(
      `/ledger/tax/export/?${query}`,
      { method: "GET", cache: "no-store" },
    );
    if (result.errorResponse) return result.errorResponse;
    if (!result.response)
      return new NextResponse("Document unavailable", { status: 503 });
    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-type", "content-disposition"]) {
      const value = result.response.headers.get(name);
      if (value) headers.set(name, value);
    }
    const response = new NextResponse(result.response.body, {
      status: result.response.status,
      headers,
    });
    if (result.accessToken) setAccessTokenCookie(response, result.accessToken);
    return response;
  } catch {
    return new NextResponse("Unable to load document", { status: 503 });
  }
}
