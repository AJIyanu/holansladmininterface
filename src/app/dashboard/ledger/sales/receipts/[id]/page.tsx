import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import type { Receipt } from "@/features/sales-receipt/types";
import { ReceiptControls } from "@/components/sales-receipt/ReceiptControls";
import { ReceiptTemplate } from "@/templates/ReceiptTemplate";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    !(user.is_staff || user.is_superuser) ||
    !hasPermission(user, "ledger.salesledger.view") ||
    !hasPermission(user, "ledger.salesreceipt.view")
  )
    notFound();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  let receipt: Receipt;
  try {
    receipt = await serverFetch<Receipt>(`/ledger/sales-receipts/${id}/`);
  } catch (error) {
    if (error instanceof ServerFetchError && [403, 404].includes(error.status))
      notFound();
    throw error;
  }
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <Link className="underline" href="/dashboard/ledger/ledgers/sales">
        Back to sales ledger
      </Link>
      <header>
        <h1 className="font-heading text-3xl font-bold">Payment receipt</h1>
        <p className="break-words">
          {receipt.reference} · {receipt.date}
        </p>
        <p>Recorded by {receipt.actor_name}</p>
      </header>
      {receipt.reversed && (
        <p
          role="alert"
          className="rounded border border-destructive p-4 text-destructive"
        >
          This payment has been reversed. The original receipt remains available
          for your records.
        </p>
      )}
      <ReceiptControls
        receipt={receipt}
        canPrint={hasPermission(user, "ledger.salesreceipt.print")}
        canEmail={hasPermission(user, "ledger.salesreceipt.email")}
      />
      <ReceiptTemplate receipt={receipt} />
      {hasPermission(user, "ledger.salesreceipt.email") && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Email history</h2>
          <p className="text-sm text-muted-foreground">
            Provider acceptance does not confirm inbox delivery. An unknown
            outcome may have been sent; check before starting another attempt.
          </p>
          {receipt.emails?.length ? (
            receipt.emails.map((email) => (
              <article key={email.id} className="space-y-1 rounded border p-3">
                <p>
                  {email.destination} ·{" "}
                  {email.status === "SENT"
                    ? "Provider accepted"
                    : email.status === "UNKNOWN"
                      ? "Unknown outcome"
                      : "Sending — outcome pending"}
                </p>
                <p>{email.subject}</p>
                <p>
                  {email.actor_name} · {email.created_at}
                </p>
              </article>
            ))
          ) : (
            <p>No emails sent.</p>
          )}
        </section>
      )}
    </main>
  );
}
