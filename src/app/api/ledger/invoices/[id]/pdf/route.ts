import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedRouteFetch } from "@/lib/authenticated-route-fetch";
import { setAccessTokenCookie } from "@/lib/auth-tokens";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new NextResponse("Not found", { status: 404 });
  const revision = request.nextUrl.searchParams.get("revision");
  if (revision && !z.uuid().safeParse(revision).success)
    return new NextResponse("Invalid revision", { status: 400 });
  try {
    const result = await authenticatedRouteFetch(
      `/ledger/sales-invoices/${id}/pdf/${revision ? `?revision=${revision}` : ""}`,
      { method: "GET", cache: "no-store" },
    );
    if (result.errorResponse) return result.errorResponse;
    if (!result.response)
      return new NextResponse("Invoice unavailable", { status: 503 });
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
    return new NextResponse("Unable to load invoice", { status: 503 });
  }
}
