import { PartyLedgerPage } from "@/components/party-ledger/PartyLedgerPage";
export const metadata = { title: "Sales Ledger | HolanSL" };
export default async function SalesLedgerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PartyLedgerPage kind="sales" search={await searchParams} />;
}
