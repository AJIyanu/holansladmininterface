import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function proxyRequest(req: NextRequest, method: string, path: string[]) {
  const endpoint = `${API_BASE_URL}/procurement/${path.join("/")}/`;

  const token = req.cookies.get("access_token")?.value;

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text();
  }
  console.log("Proxying request body:", body);

  const res = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
    cache: "no-store",
  });

  const data = await res.text();
  console.log(`Response from ${endpoint}:`, data);
  return new NextResponse(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

// GET
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  return proxyRequest(req, "GET", params.path);
}

// POST
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  // console.log("POST request to path:", params.path);
  return proxyRequest(req, "POST", params.path);
}

// PUT
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  return proxyRequest(req, "PUT", params.path);
}

// PATCH
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  return proxyRequest(req, "PATCH", params.path);
}

// DELETE
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  return proxyRequest(req, "DELETE", params.path);
}
