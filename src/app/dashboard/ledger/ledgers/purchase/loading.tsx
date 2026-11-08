import { LedgerPageSkeleton } from "@/components/ledger/LoadingSkeleton";

export default function LoadingPurchaseLedger() {
  return (
    <LedgerPageSkeleton label="Loading purchase ledger…" variant="party" />
  );
}
