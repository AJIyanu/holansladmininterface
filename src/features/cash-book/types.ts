export interface CashEntry {
  account: string;
  currency: string;
  party_transaction_id?: string | null;
  id: string;
  date: string;
  kind: "RECEIPT" | "EXPENSE" | "CAPITAL";
  amount: string;
  description: string;
  reference: string;
  version: number;
  running_balance?: string;
  created_by_name: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
}
export interface JournalEntry {
  currency: string;
  id: string;
  entry: string | null;
  party_transaction: string | null;
  date: string;
  amount: string;
  debit_account: string;
  credit_account: string;
  description: string;
  reference: string;
  reason: string;
  reverses: string | null;
  actor_name: string;
  created_at: string;
}
export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface CashPage extends Page<CashEntry> {
  summary: {
    currency: string;
    year: number;
    date_from: string;
    date_to: string;
    opening_balance: string;
    debit: string;
    credit: string;
    closing_balance: string;
  };
}
export function money(value: string, currency = "NGN"): string {
  const negative = value.startsWith("-");
  const [whole, cents = "00"] = value.replace(/^-/, "").split(".");
  return `${negative ? "−" : ""}${({ NGN: "₦", USD: "$", GBP: "£" } as Record<string, string>)[currency] ?? currency}${BigInt(whole).toLocaleString("en-NG")}.${cents.padEnd(2, "0")}`;
}
export const accountNames: Record<string, string> = {
  CASH: "Cash",
  INCOME: "Income",
  EXPENSE: "Expenses",
  CAPITAL: "Capital introduced",
  RECEIVABLE: "Client receivables",
  PAYABLE: "Supplier payables",
  DEFERRED_REVENUE: "Unearned sales",
  PURCHASE_CLEARING: "Purchases pending classification",
};
