import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientRequest, Party } from "@/types/procurement";
import RequestsTable from "@/components/tables/RequestsTable";
import RequestFilters from "@/components/RequestFilters";

export interface SearchParams {
  search?: string;
  status?: string;
  client?: string;
  page?: string;
}

async function fetchRequests(
  searchParams: SearchParams
): Promise<ClientRequest[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) redirect("/login");

  const params = new URLSearchParams();
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.status) params.set("status", searchParams.status);
  if (searchParams.client) params.set("client", searchParams.client);
  if (searchParams.page) params.set("page", searchParams.page);

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/procurement/client-requests/?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    // throw new Error("Failed to fetch requests");
    return [];
  }

  return response.json();
}

async function fetchClients(): Promise<Party[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/crm/parties/?party_type=client`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="hidden lg:block">
          <div className="grid grid-cols-8 gap-4 p-4 border-b font-medium">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-4 p-4 border-b">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} className="h-4" />
              ))}
            </div>
          ))}
        </div>

        <div className="lg:hidden p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function RequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");

  return (
    <div className="space-y-6 m-9">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Requests</h1>
          <p className="text-gray-600">Manage and track all client requests</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/requests/new">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <RequestsContent searchParams={params} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}

async function RequestsContent({
  searchParams,
  currentPage,
}: {
  searchParams: SearchParams;
  currentPage: number;
}) {
  const [requestsData, clients] = await Promise.all([
    fetchRequests(searchParams),
    fetchClients(),
  ]);

  return (
    <>
      <RequestFilters clients={clients} />
      <RequestsTable
        data={requestsData}
        currentPage={currentPage}
        searchParams={searchParams}
      />
    </>
  );
}
