import { LedgerPageSkeleton } from "@/components/ledger/LoadingSkeleton";

export default function LoadingCashBook() {
  return <LedgerPageSkeleton label="Loading cash book…" variant="cashbook" />;
}
