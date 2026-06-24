import { NextRequest } from "next/server";

import { forwardAccountRequest } from "@/lib/account-route-handler";

export async function GET(request: NextRequest) {
  return forwardAccountRequest(
    `/account/departments/${request.nextUrl.search}`,
    {
      method: "GET",
    },
  );
}

export async function POST(request: NextRequest) {
  return forwardAccountRequest("/account/departments/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: await request.text(),
  });
}
