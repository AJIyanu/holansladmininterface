import { PartyLedgerPage } from "@/components/party-ledger/PartyLedgerPage";
export const metadata = { title: "Purchase Ledger | HolanSL" };
export default async function PurchaseLedgerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PartyLedgerPage kind="purchase" search={await searchParams} />;
}
