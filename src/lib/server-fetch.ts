import { cookies } from "next/headers";
// import { env } from "@/lib/env";

type ServerFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const url = `${process.env.DJANGO_API_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token
        ? {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": `Bearer ${token}`,
            "User-Agent": "Mozilla/5.0 (VercelApp)",
          }
        : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
