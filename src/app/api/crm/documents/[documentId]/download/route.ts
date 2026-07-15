import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { refreshAccessToken, setAuthCookies } from "@/lib/auth-tokens";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function djangoDocumentUrl(documentId: string): URL {
  const apiUrl = process.env.DJANGO_API_URL;

  if (!apiUrl) {
    throw new Error("DJANGO_API_URL is not configured.");
  }

  return new URL(`/crm/documents/${documentId}/download/`, apiUrl);
}

function authHeaders(token: string): Headers {
  const headers = new Headers();

  headers.set("Accept", "*/*");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Auth-Token", `Bearer ${token}`);
  headers.set("User-Agent", "Mozilla/5.0 (VercelApp)");

  return headers;
}

async function fetchDocument(
  documentId: string,
  token: string,
): Promise<Response> {
  return fetch(djangoDocumentUrl(documentId), {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });
}

function shouldAttemptRefresh(response: Response): boolean {
  return response.status === 401 || response.status === 403;
}

async function errorResponseFromDjango(
  response: Response,
): Promise<NextResponse> {
  const contentType =
    response.headers.get("content-type") ?? "application/json";

  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({
        detail: "Document request failed.",
      }))
    : {
        detail:
          (await response.text().catch(() => "")) || "Document request failed.",
      };

  return NextResponse.json(body, {
    status: response.status,
  });
}

function streamDjangoDocument(response: Response): NextResponse {
  const headers = new Headers();

  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";

  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-store, private");

  const contentDisposition = response.headers.get("content-disposition");

  if (contentDisposition) {
    headers.set("Content-Disposition", contentDisposition);
  }

  const contentLength = response.headers.get("content-length");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { documentId } = await context.params;
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;

  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        detail: "Authentication is required.",
      },
      {
        status: 401,
      },
    );
  }

  let response = await fetchDocument(documentId, accessToken);

  if (!response.ok && shouldAttemptRefresh(response) && refreshToken) {
    const refreshedTokens = await refreshAccessToken(refreshToken);

    if (refreshedTokens?.access) {
      response = await fetchDocument(documentId, refreshedTokens.access);

      if (response.ok) {
        const nextResponse = streamDjangoDocument(response);

        setAuthCookies(nextResponse, refreshedTokens);

        return nextResponse;
      }
    }
  }

  if (!response.ok) {
    return errorResponseFromDjango(response);
  }

  return streamDjangoDocument(response);
}
