import { NextResponse } from "next/server";

import {
  authenticatedRouteFetch,
  createAuthenticatedResponse,
} from "@/lib/authenticated-route-fetch";
import { setAccessTokenCookie } from "@/lib/auth-tokens";

export async function forwardAccountRequest(
  path: string,
  options: RequestInit,
): Promise<NextResponse> {
  const { response, accessToken, errorResponse } =
    await authenticatedRouteFetch(path, options);

  if (errorResponse) {
    return errorResponse;
  }

  if (!response) {
    return NextResponse.json(
      {
        detail: "Unable to contact the backend service.",
      },
      {
        status: 503,
      },
    );
  }

  if (response.status === 204) {
    const nextResponse = new NextResponse(null, {
      status: 204,
    });

    if (accessToken) {
      setAccessTokenCookie(nextResponse, accessToken);
    }

    return nextResponse;
  }

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : {
        detail: await response.text(),
      };

  return createAuthenticatedResponse(data, response.status, accessToken);
}
