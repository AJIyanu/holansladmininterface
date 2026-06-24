import { NextRequest } from "next/server";

import { forwardAccountRequest } from "@/lib/account-route-handler";

export async function GET(request: NextRequest) {
  return forwardAccountRequest(`/account/users/${request.nextUrl.search}`, {
    method: "GET",
  });
}
