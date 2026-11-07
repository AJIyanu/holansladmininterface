export type LedgerKind = "sales" | "purchase";
export interface LedgerParty {
  id: string;
  display_name: string;
  entity_kind: string;
  status: string;
}
export interface LedgerSelection {
  kind: LedgerKind;
  selected_party: LedgerParty | null;
}
export interface PartyResults {
  count: number;
  next: string | null;
  previous: string | null;
  results: LedgerParty[];
}
export function ledgerPermission(kind: LedgerKind) {
  return `ledger.${kind}ledger.view`;
}

export interface OutstandingDocument {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: string;
  outstanding: string;
}
export interface OutstandingPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: OutstandingDocument[];
}
