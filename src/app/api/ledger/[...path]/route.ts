import { NextRequest, NextResponse } from "next/server";
import { authenticatedRouteFetch } from "@/lib/authenticated-route-fetch";
import { setAccessTokenCookie } from "@/lib/auth-tokens";
const collections = new Set([
  "invoices",
  "receipts",
  "payments",
  "supplier-bills",
  "expenses",
  "advances",
  "advance-clearances",
  "credit-notes",
  "withholdings",
  "tax-remittances",
  "manual-journals",
  "opening-balances",
  "currencies",
  "accounts",
  "account-currencies",
  "cash-accounts",
  "posting-policies",
  "tax-types",
  "tax-policies",
  "financial-years",
  "periods",
  "allocations",
  "client-statements",
  "withholding-authorizations",
  "approval-requests",
  "finance-submissions",
  "documents",
  "journals",
  "capabilities",
  "approval-routing",
  "client-codes",
  "recognize-revenue",
  "tax-reports",
  "trial-balance",
  "analytics",
  "account-book",
  "lookups",
]);
type Context = { params: Promise<{ path: string[] }> };
async function proxy(request: NextRequest, context: Context) {
  const { path } = await context.params;
  if (
    !collections.has(path[0]) ||
    path.some((part) => !/^[a-zA-Z0-9-]+$/.test(part))
  )
    return NextResponse.json(
      { detail: "Unknown ledger route." },
      { status: 404 },
    );
  if (
    request.method !== "GET" &&
    request.headers.get("origin") &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  const headers = new Headers();
  for (const name of ["content-type", "idempotency-key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const body =
      request.method === "GET" ? undefined : await request.arrayBuffer();
    if (body && body.byteLength > 25 * 1024 * 1024)
      return NextResponse.json(
        { detail: "Upload exceeds 25 MiB." },
        { status: 413 },
      );
    const result = await authenticatedRouteFetch(
      `/ledger/${path.join("/")}/${request.nextUrl.search}`,
      { method: request.method, headers, body, cache: "no-store" },
    );
    if (result.errorResponse) return result.errorResponse;
    if (!result.response)
      return NextResponse.json(
        { detail: "Accounts service unavailable." },
        { status: 503 },
      );
    const outputHeaders = new Headers({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-type", "content-disposition"]) {
      const value = result.response.headers.get(name);
      if (value) outputHeaders.set(name, value);
    }
    const response = new NextResponse(result.response.body, {
      status: result.response.status,
      headers: outputHeaders,
    });
    if (result.accessToken) setAccessTokenCookie(response, result.accessToken);
    return response;
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach ledger. Retry the same submission." },
      { status: 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
