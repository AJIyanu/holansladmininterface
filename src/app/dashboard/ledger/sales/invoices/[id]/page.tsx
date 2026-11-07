import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { InvoiceControls } from "@/components/sales-invoice/InvoiceControls";
import type { Invoice } from "@/features/sales-invoice/types";
import { InvoiceTemplate } from "@/templates/InvoiceTemplate";
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.salesledger.view") ||
    !hasPermission(user, "ledger.salesinvoice.view")
  )
    notFound();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  let invoice: Invoice;
  try {
    invoice = await serverFetch<Invoice>(`/ledger/sales-invoices/${id}/`);
  } catch (error) {
    if (error instanceof ServerFetchError && [403, 404].includes(error.status))
      notFound();
    return (
      <main className="p-6">
        <p role="alert">Unable to load this invoice. Refresh and try again.</p>
      </main>
    );
  }
  const permissions = {
    edit: hasPermission(user, "ledger.salesinvoice.edit"),
    confirm: hasPermission(user, "ledger.salesinvoice.confirm"),
    deliver:
      hasPermission(user, "ledger.salesinvoice.deliver") &&
      hasPermission(user, "ledger.salestransaction.create"),
    print: hasPermission(user, "ledger.salesinvoice.print"),
    email: hasPermission(user, "ledger.salesinvoice.email"),
  };
  return (
    <main className="space-y-6 p-4 md:p-6">
      <Link href="/dashboard/ledger/sales" className="text-sm underline">
        Back to sales ledger
      </Link>
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Sales Ledger · Invoice</p>
        <h1 className="break-words text-3xl font-bold">
          {invoice.reference ?? "Draft invoice"}
        </h1>
        <p>
          {invoice.delivered_at
            ? `Delivered · ${invoice.delivered_at}`
            : invoice.confirmed
              ? "Confirmed · Not delivered"
              : "Draft · Not delivered"}
        </p>
      </header>
      <InvoiceControls
        key={`${invoice.id}-${invoice.version}-${invoice.confirmed}`}
        invoice={invoice}
        permissions={permissions}
      />
      <InvoiceTemplate invoice={invoice} />
      {invoice.reference && (
        <details className="rounded border p-4">
          <summary className="cursor-pointer font-semibold">
            Internal item references
          </summary>
          <ul className="mt-3 space-y-2">
            {invoice.items.map((item, index) => (
              <li key={item.id ?? index} className="break-words">
                {invoice.reference}.{item.position ?? index + 1} ·{" "}
                {item.description}
              </li>
            ))}
          </ul>
        </details>
      )}
      {!!invoice.revisions?.length && (
        <details className="rounded border p-4">
          <summary className="cursor-pointer font-semibold">
            Confirmed document history
          </summary>
          <ul className="mt-3 space-y-2">
            {invoice.revisions.map((r) => (
              <li key={r.id}>
                Revision {r.version} · {r.actor__username} ·{" "}
                {r.created_at.slice(0, 10)}{" "}
                {permissions.print && (
                  <a
                    className="ml-2 underline"
                    href={`/api/ledger/invoices/${invoice.id}/pdf?revision=${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      {permissions.email && (
        <section className="space-y-3 rounded border p-4">
          <h2 className="font-semibold">Email history</h2>
          {invoice.emails?.length ? (
            invoice.emails.map((e) => (
              <details key={e.id}>
                <summary className="cursor-pointer break-words">
                  {(
                    {
                      SENT: "Accepted by email provider",
                      SENDING: "Sending",
                      UNKNOWN: "Delivery not confirmed",
                    } as Record<string, string>
                  )[e.status] ?? e.status}{" "}
                  · {e.destination} · Revision {e.invoice_version}
                </summary>
                <p className="text-sm">
                  {e.actor_name} · {e.created_at}
                </p>
                <p>{e.subject}</p>
                <p className="whitespace-pre-wrap break-words">{e.message}</p>
              </details>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No email attempts yet.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
