import { ReceiptEditor } from "@/components/sales-receipt/ReceiptEditor";
import { SalesReceipts } from "@/components/sales-receipt/SalesReceipts";
import Link from "next/link";
import { StatementHistory } from "./StatementHistory";
import { WorkspaceTools } from "./WorkspaceTools";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import {
  ledgerPermission,
  type LedgerKind,
  type LedgerSelection,
} from "@/features/party-ledger/types";
import { PartySelector } from "./PartySelector";
import { PartyTransactions } from "./PartyTransactions";
import { SalesInvoices } from "@/components/sales-invoice/SalesInvoices";
import { PurchaseEditor } from "@/components/purchases/PurchaseEditor";
import { PurchaseHistory } from "@/components/purchases/PurchaseHistory";
import type { BookSearch } from "@/components/cash-book/BookFilters";

export async function PartyLedgerPage({
  kind,
  search,
}: {
  kind: LedgerKind;
  search: BookSearch;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, ledgerPermission(kind))
  )
    notFound();
  const title = kind === "sales" ? "Sales Ledger" : "Purchase Ledger";
  const label = kind === "sales" ? "client" : "supplier";
  let state: LedgerSelection | undefined;
  let error: string | undefined;
  try {
    state = await serverFetch<LedgerSelection>(
      `/ledger/party-ledgers/${kind}/`,
    );
  } catch (caught) {
    error =
      caught instanceof ServerFetchError && caught.status === 403
        ? "You no longer have permission to view this ledger."
        : "Unable to load your ledger selection. Please try again.";
  }
  const accounts = await serverFetch<
    Array<{
      id: string;
      name: string;
      kind: string;
      currency: string;
      is_active: boolean;
    }>
  >("/ledger/accounts/");
  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Accounts</p>
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          Select a {label} to open their ledger workspace.
        </p>
      </header>
      {error ? (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <p role="alert">{error}</p>
          <Link
            className="underline"
            href={`/dashboard/ledger/ledgers/${kind}`}
          >
            Try again
          </Link>
        </div>
      ) : (
        state && (
          <>
            <section
              aria-label={`${label} selection`}
              className="space-y-2 rounded-xl border bg-card p-5"
            >
              <h2 className="font-heading text-lg font-semibold">
                {kind === "sales" ? "Client" : "Supplier"}
              </h2>
              <PartySelector kind={kind} selected={state.selected_party} />
              <p className="text-sm text-muted-foreground">
                Your selection is remembered separately for each ledger.
              </p>
            </section>
            {state.selected_party ? (
              <section className="space-y-3 rounded-xl border bg-card p-6">
                <h2 className="break-words font-heading text-xl font-semibold">
                  {state.selected_party.display_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  CRM status: {state.selected_party.status.toLowerCase()}
                </p>
                {state.selected_party.status === "ACTIVE" &&
                  (kind === "purchase" ||
                    hasPermission(
                      user,
                      `ledger.${kind}transaction.create`,
                    )) && (
                    <div className="flex flex-wrap gap-3">
                      {kind === "purchase" && (
                        <>
                          {hasPermission(user, "ledger.purchasebill.view") &&
                            hasPermission(
                              user,
                              "ledger.purchasebill.create",
                            ) && (
                              <PurchaseEditor
                                key={`${state.selected_party.id}-bill`}
                                kind="bills"
                                party={state.selected_party.id}
                                canDeliver={
                                  hasPermission(
                                    user,
                                    "ledger.purchasebill.deliver",
                                  ) &&
                                  hasPermission(
                                    user,
                                    "ledger.purchasetransaction.create",
                                  )
                                }
                              />
                            )}
                          {hasPermission(
                            user,
                            "ledger.purchasetransaction.create",
                          ) &&
                            hasPermission(
                              user,
                              "ledger.purchasepayment.view",
                            ) &&
                            hasPermission(
                              user,
                              "ledger.purchasepayment.create",
                            ) &&
                            hasPermission(
                              user,
                              "ledger.cashbookentry.create",
                            ) && (
                              <PurchaseEditor
                                key={`${state.selected_party.id}-payment`}
                                kind="payments"
                                party={state.selected_party.id}
                                accounts={accounts}
                                canCopy={hasPermission(
                                  user,
                                  "ledger.purchasebill.view",
                                )}
                              />
                            )}
                        </>
                      )}
                      {kind === "sales" &&
                        hasPermission(user, "ledger.cashbookentry.create") &&
                        hasPermission(user, "ledger.salesreceipt.view") &&
                        hasPermission(user, "ledger.salesreceipt.create") && (
                          <ReceiptEditor
                            key={state.selected_party.id}
                            party={state.selected_party.id}
                            accounts={accounts}
                            canViewInvoices={hasPermission(
                              user,
                              "ledger.salesinvoice.view",
                            )}
                            defaults={{
                              billed_to: state.selected_party.display_name,
                              billing_address: "",
                              recipient_email: "",
                            }}
                          />
                        )}
                    </div>
                  )}
                {kind === "sales" &&
                  hasPermission(user, "ledger.salesinvoice.view") && (
                    <SalesInvoices
                      party={state.selected_party.id}
                      search={search}
                      canCreate={
                        state.selected_party.status === "ACTIVE" &&
                        hasPermission(user, "ledger.salesinvoice.create")
                      }
                    />
                  )}
                {kind === "sales" &&
                  hasPermission(user, "ledger.salesreceipt.view") && (
                    <SalesReceipts
                      party={state.selected_party.id}
                      search={search}
                    />
                  )}
                {kind === "purchase" && (
                  <>
                    {hasPermission(user, "ledger.purchasebill.view") && (
                      <PurchaseHistory
                        kind="bills"
                        party={state.selected_party.id}
                        search={search}
                      />
                    )}
                    {hasPermission(user, "ledger.purchasepayment.view") && (
                      <PurchaseHistory
                        kind="payments"
                        party={state.selected_party.id}
                        search={search}
                      />
                    )}
                  </>
                )}
                <WorkspaceTools
                  key={`${kind}-${state.selected_party.id}`}
                  kind={kind}
                  party={state.selected_party.id}
                  canCorrect={hasPermission(
                    user,
                    `ledger.${kind}ledger.correct`,
                  )}
                  canCash={hasPermission(user, "ledger.cashbookentry.create")}
                  canRecognize={
                    kind === "sales" &&
                    hasPermission(user, "ledger.salesledger.recognize")
                  }
                  canPrint={
                    hasPermission(user, "ledger.reconciliation.create") &&
                    hasPermission(user, "ledger.reconciliation.view")
                  }
                />
                {hasPermission(user, "ledger.reconciliation.view") && (
                  <StatementHistory
                    kind={kind}
                    party={state.selected_party.id}
                    search={search}
                  />
                )}
                <PartyTransactions
                  kind={kind}
                  partyId={state.selected_party.id}
                  search={search}
                />
              </section>
            ) : (
              <section className="rounded-xl border bg-card p-8 text-center">
                <h2 className="font-heading text-xl font-semibold">
                  Select a {label} to begin
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Search your existing CRM {label}s using the selector above.
                </p>
              </section>
            )}
          </>
        )
      )}
    </main>
  );
}
