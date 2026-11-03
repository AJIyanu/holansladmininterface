export interface CashEntry {
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
  id: string;
  entry: string;
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
    currency: "NGN";
    year: number;
    date_from: string;
    date_to: string;
    opening_balance: string;
    debit: string;
    credit: string;
    closing_balance: string;
  };
}
export function money(value: string): string {
  const negative = value.startsWith("-");
  const [whole, cents = "00"] = value.replace(/^-/, "").split(".");
  return `${negative ? "−" : ""}₦${BigInt(whole).toLocaleString("en-NG")}.${cents.padEnd(2, "0")}`;
}
export const accountNames: Record<string, string> = {
  CASH: "Cash",
  INCOME: "Cash income",
  EXPENSE: "Expenses",
  CAPITAL: "Capital introduced",
};
