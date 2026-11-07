import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";
import {
  ProcurementInbox,
  type InboxItem,
} from "@/components/party-ledger/ProcurementInbox";
import {
  BookPagination,
  type BookSearch,
} from "@/components/cash-book/BookFilters";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<BookSearch>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.procurement.approve")
  )
    notFound();
  const search = await searchParams;
  const query = new URLSearchParams({
    page: typeof search.page === "string" ? search.page : "1",
  });
  const data = await serverFetch<{
    results: InboxItem[];
    count: number;
    next: string | null;
    previous: string | null;
  }>(`/ledger/procurement-inbox/?${query}`);
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Procurement approvals and posting</h1>
      <p>
        Review submitted quotations, invoice requests and supplier purchases
        within your procurement access scope. Source documents can be posted
        only once.
      </p>
      <ProcurementInbox
        rows={data.results}
        canSales={
          hasPermission(user, "ledger.salesinvoice.create") &&
          hasPermission(user, "ledger.salesinvoice.view") &&
          hasPermission(user, "ledger.salesledger.view")
        }
        canPurchase={
          hasPermission(user, "ledger.purchasetransaction.create") &&
          hasPermission(user, "ledger.purchaseledger.view")
        }
      />
      <BookPagination
        {...data}
        query={query}
        pathname="/dashboard/ledger/ledgers/procurement"
      />
    </main>
  );
}
