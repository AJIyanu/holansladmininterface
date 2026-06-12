import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import SupplierTable from "./SupplierTable";
import SupplierContactTable from "./SupplierContactTable";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>;
}) {
  const { page = "1", view = "contacts" } = await searchParams;
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  // fetch supplier parties & contacts
  const partyRes = await fetch(
    `${process.env.DJANGO_API_URL}/crm/parties/?party_type=supplier&page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const contactRes = await fetch(
    `${process.env.DJANGO_API_URL}/crm/contacts/?party_type=supplier&page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const parties = partyRes.ok ? await partyRes.json() : [];
  const contacts = contactRes.ok ? await contactRes.json() : [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Supplier Directory</h1>
        <Link
          href="/dashboard/suppliers/profiles"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add
        </Link>
      </div>

      {/* Toggle */}
      <div className="flex space-x-2">
        <Link
          href={`/dashboard/suppliers?view=contacts`}
          className={`px-3 py-1 border rounded ${
            view === "contacts" ? "bg-blue-600 text-white" : ""
          }`}
        >
          Contacts
        </Link>
        <Link
          href={`/dashboard/suppliers?view=parties`}
          className={`px-3 py-1 border rounded ${
            view === "parties" ? "bg-blue-600 text-white" : ""
          }`}
        >
          Parties
        </Link>
      </div>

      {view === "contacts" ? (
        <SupplierContactTable data={contacts} />
      ) : (
        <SupplierTable data={parties} />
      )}
    </div>
  );
}
