import { NextRequest } from "next/server";

import { forwardAccountRequest } from "@/lib/account-route-handler";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return forwardAccountRequest(`/account/roles/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: await request.text(),
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return forwardAccountRequest(`/account/roles/${id}/`, {
    method: "DELETE",
  });
}
