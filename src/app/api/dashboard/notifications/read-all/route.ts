import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/server-fetch";
import { readServerFetchResult } from "@/lib/api/read-server-fetch-result";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};

function getErrorDetail(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "detail" in value &&
    typeof value.detail === "string"
  ) {
    return value.detail;
  }

  return "Notifications could not be marked as read.";
}

export async function POST() {
  const upstreamResponse = await serverFetch("/notifications/mark-all-read/", {
    method: "POST",
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const result = await readServerFetchResult<unknown>(upstreamResponse);

  if (!result.ok) {
    return NextResponse.json(
      {
        detail: getErrorDetail(result.data),
      },
      {
        status: result.status,
        headers: NO_STORE_HEADERS,
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      detail: "All notifications marked as read.",
    },
    {
      headers: NO_STORE_HEADERS,
    },
  );
}
