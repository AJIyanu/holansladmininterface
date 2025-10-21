// app/dashboard/customers/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import CustomerTable from "./CustomerTable";
import CustomerContactTable from "./CustomerContactTable";
import { serverFetch } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>;
}) {
  const { page = "1", view = "contacts" } = await searchParams;
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  // fetch parties (client)
  const [partyRes, contactRes] = await Promise.all([
    serverFetch(`/crm/parties/?party_type=client&page=${page}`),
    serverFetch(`/crm/contacts/?party_type=client&page=${page}`),
  ]);

  const parties = partyRes.success ? partyRes.data ?? [] : [];
  const contacts = contactRes.success ? contactRes.data ?? [] : [];

  //   console.log("PARTIES:", parties);
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Customer Directory</h1>
        <Link
          href="/dashboard/customers/profiles"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add
        </Link>
      </div>

      {/* Toggle */}
      <div className="flex space-x-2">
        <Link
          href={`/dashboard/customers?view=contacts`}
          className={`px-3 py-1 border rounded ${
            view === "contacts" ? "bg-blue-600 text-white" : ""
          }`}
        >
          Contacts
        </Link>
        <Link
          href={`/dashboard/customers?view=parties`}
          className={`px-3 py-1 border rounded ${
            view === "parties" ? "bg-blue-600 text-white" : ""
          }`}
        >
          Parties
        </Link>
      </div>

      {view === "contacts" ? (
        <CustomerContactTable data={contacts} />
      ) : (
        <CustomerTable data={parties} />
      )}
    </div>
  );
}
