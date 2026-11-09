import type { Page } from "@/features/cash-book/types";
export type { Page };
export interface Staff {
  id: string;
  name: string;
  username: string;
  is_active: boolean;
}
export interface Account {
  id: string;
  name: string;
  kind: string;
  currency: string;
  is_active: boolean;
}
export interface Evidence {
  id: string;
  filename: string;
  item_position: number | null;
}
export interface StaffEntry {
  staff_name: string;
  id: string;
  staff: string;
  kind: "PAY" | "RECEIVE" | "RETIRE";
  category: string;
  date: string;
  currency: string;
  amount: string;
  description: string;
  reference: string;
  related_entry: string | null;
  receivable_delta: string;
  payable_delta: string;
  actor_name: string;
  created_at: string;
  account_name: string;
  documents: Evidence[];
  retirement_id: string | null;
  remaining?: string;
  reimbursement_due?: string;
}
export interface Expense {
  position?: number;
  date: string;
  category: string;
  description: string;
  amount: string;
}
export interface Retirement {
  staff_name: string;
  id: string;
  advance: string;
  staff_id: string;
  advance_description: string;
  date: string;
  description: string;
  total: string;
  currency: string;
  items: Expense[];
  documents: Evidence[];
  actor_name: string;
  created_at: string;
  remaining_advance: string;
  decision: {
    approved: boolean;
    date: string;
    reason: string;
    actor_name: string;
    entry: string | null;
  } | null;
}
export type Summary = Record<
  | "opening_receivable"
  | "opening_payable"
  | "paid"
  | "received"
  | "approved_expenses"
  | "closing_receivable"
  | "closing_payable"
  | "loans"
  | "unretired_advances"
  | "change_due"
  | "reimbursement_due",
  string
>;
export interface StatementRow {
  id: string;
  date_from: string;
  date_to: string;
  currency: string;
  created_at: string;
}
export interface StaffStatement extends StatementRow {
  actor_name: string;
  snapshot: {
    staff: { id: string; name: string };
    company: Record<string, unknown>;
    currency: string;
    date_from: string;
    date_to: string;
    summary: Summary;
    transactions: Array<
      StaffEntry & { receivable_balance: string; payable_balance: string }
    >;
  };
}
export const labels: Record<string, string> = {
  PAY: "Pay staff",
  RECEIVE: "Receive from staff",
  RETIRE: "Retire advance",
  SALARY: "Salary",
  ALLOWANCE: "Allowance",
  TRANSPORT: "Transportation",
  EXPENSE: "Staff expense",
  LOAN: "Staff loan",
  ADVANCE: "Advance",
  ADVANCE_REIMBURSEMENT: "Advance reimbursement",
  OTHER_PAYMENT: "Other staff expense",
  ADVANCE_RETURN: "Return advance / change",
  LOAN_REPAYMENT: "Loan repayment",
  LEVY: "Staff levy",
  CONTRIBUTION: "Staff contribution",
  OTHER_RECEIPT: "Other income",
  ACCOMMODATION: "Accommodation",
  MEALS: "Meals",
  PURCHASES: "Purchases",
  COMMUNICATION: "Communication",
  OTHER: "Other expense",
  EXPENSE_BREAKDOWN: "Approved expense breakdown",
  opening_receivable: "Prior amount due from staff",
  opening_payable: "Prior reimbursement due to staff",
  paid: "Paid to staff",
  received: "Received from staff",
  approved_expenses: "Approved advance expenses",
  closing_receivable: "Amount due from staff",
  closing_payable: "Amount due to staff",
  loans: "Outstanding loans",
  unretired_advances: "Unretired advances",
  change_due: "Change due from staff",
  reimbursement_due: "Reimbursement due to staff",
};
