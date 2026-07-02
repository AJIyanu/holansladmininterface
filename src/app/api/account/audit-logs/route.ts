import { NextRequest } from "next/server";

import { forwardAccountRequest } from "@/lib/account-route-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardAccountRequest(
    `/account/audit-logs/${request.nextUrl.search}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}
