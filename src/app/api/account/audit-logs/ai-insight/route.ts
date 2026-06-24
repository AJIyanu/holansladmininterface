import { NextRequest } from "next/server";

import { forwardAccountRequest } from "@/lib/account-route-handler";

export async function GET(request: NextRequest) {
  return forwardAccountRequest(
    `/account/audit-logs/ai-insight/${request.nextUrl.search}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}
