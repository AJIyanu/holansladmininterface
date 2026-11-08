import { LedgerPageSkeleton } from "@/components/ledger/LoadingSkeleton";

export default function LoadingJournal() {
  return (
    <LedgerPageSkeleton
      label="Loading double-entry journal…"
      variant="journal"
    />
  );
}
