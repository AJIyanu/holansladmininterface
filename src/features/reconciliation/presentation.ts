export interface StatementRow {
  id: string;
  date: string;
  type: string;
  reference: string;
  document_reference?: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  document_vat?: string;
  vat_recognised?: string;
  vat_cash?: string;
  wht?: string;
  actual_cash?: string;
  combined_balance?: string;
}
export interface PartySnapshot {
  party: { name: string };
  company: Record<string, unknown>;
  currency: string;
  date_from: string;
  date_to: string;
  opening_balance: string;
  closing_balance: string;
  tax?: Record<string, string>;
  print_version?: number;
  transactions: StatementRow[];
}
export type Tone = "prior" | "invoiced" | "received" | "plain" | "balance";
export interface SummaryLine {
  label: string;
  amount: string;
  tone: Tone;
  emphasis?: boolean;
}
export interface PrintRow {
  id: string;
  date: string;
  description: string;
  reference: string;
  charged: string;
  received: string;
  tone: "invoice" | "receipt" | "neutral";
}
export function cents(value = "0"): bigint {
  if (!/^-?\d+(\.\d{1,2})?$/.test(value))
    throw new Error("Invalid statement amount");
  const negative = value.startsWith("-");
  const [whole, fraction = ""] = value.replace(/^-/, "").split(".");
  const amount = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  return negative ? -amount : amount;
}
export function amount(value: bigint): string {
  const v = value < BigInt(0) ? -value : value;
  return `${value < BigInt(0) ? "-" : ""}${v / BigInt(100)}.${String(v % BigInt(100)).padStart(2, "0")}`;
}
export function statementDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][Number(match[2]) - 1];
  return month ? `${month} ${match[3]}, ${match[1]}` : value;
}
export function partyPresentation(s: PartySnapshot, kind: string) {
  const opening = cents(s.tax?.opening_total ?? s.opening_balance),
    closing = cents(s.tax?.closing_total ?? s.closing_balance);
  let invoiced = BigInt(0),
    vat = BigInt(0),
    received = BigInt(0),
    wht = BigInt(0),
    previous = opening;
  const rows: PrintRow[] = [];
  for (const r of s.transactions) {
    const invoice = ["INVOICE", "BILL"].includes(r.type);
    const cash = cents(
      r.actual_cash ??
        (r.type === "PAYMENT"
          ? r.credit
          : r.type === "REFUND"
            ? amount(-cents(r.debit))
            : "0"),
    );
    const held = cents(r.wht ?? "0"),
      next = cents(r.combined_balance ?? r.balance),
      movement = next - previous;
    const goods = invoice ? cents(r.debit) : BigInt(0);
    // Older snapshots retain only recognised VAT; do not invent missing delivery VAT.
    const tax = invoice
      ? cents(r.document_vat ?? r.vat_recognised ?? "0")
      : BigInt(0);
    invoiced += goods;
    vat += tax;
    received += cash;
    wht += held;
    const reference =
      r.document_reference ??
      (kind === "purchase" &&
      r.type === "PAYMENT" &&
      /^PAY-[0-9a-f-]{36}$/i.test(r.reference)
        ? ""
        : r.reference);
    const labels: Record<string, string> = {
      INVOICE: "Invoice",
      BILL: "Supplier invoice",
      PAYMENT: kind === "sales" ? "Receipt" : "Payment",
      REFUND: "Refund",
      CREDIT: "Credit",
      REVERSAL: "Reversal",
      VAT_SETTLE: "VAT settlement",
      OPENING: "Tax opening",
      ADJUST_UP: "Adjustment",
      ADJUST_DOWN: "Adjustment",
    };
    const description = `${labels[r.type] ?? r.type.replaceAll("_", " ")} — ${r.description}`;
    const charge = movement + cash + held;
    const invoiceAmount = goods + tax;
    rows.push({
      id: r.id,
      date: r.date,
      description:
        description + (held !== BigInt(0) ? ` (WHT ${amount(held)})` : ""),
      reference,
      charged: amount(invoice ? invoiceAmount : charge),
      received: amount(cash),
      tone: invoice
        ? "invoice"
        : cash > BigInt(0)
          ? "receipt"
          : charge !== BigInt(0)
            ? "invoice"
            : "neutral",
    });
    if (invoice && charge !== invoiceAmount)
      rows.push({
        id: `${r.id}-vat-adjustment`,
        date: r.date,
        description: "VAT advance / opening adjustment",
        reference,
        charged: amount(charge - invoiceAmount),
        received: "0.00",
        tone: "neutral",
      });
    previous = next;
  }
  const adjustments = closing - opening - invoiced - vat + received + wht;
  const summary: SummaryLine[] = [
    { label: "Prior balance", amount: amount(opening), tone: "prior" },
    {
      label:
        kind === "sales"
          ? "Total invoiced without VAT"
          : "Total supplier invoices without VAT",
      amount: amount(invoiced),
      tone: "invoiced",
    },
    { label: "Total VAT", amount: amount(vat), tone: "invoiced" },
    {
      label: "Total invoiced with VAT",
      amount: amount(invoiced + vat),
      tone: "invoiced",
      emphasis: true,
    },
    {
      label: kind === "sales" ? "Total received" : "Total paid",
      amount: amount(received),
      tone: "received",
    },
    { label: "Total WHT", amount: amount(wht), tone: "plain" },
    ...(adjustments !== BigInt(0)
      ? [
          {
            label: "Credits / other adjustments",
            amount: amount(adjustments),
            tone: "plain" as Tone,
          },
        ]
      : []),
    {
      label: "Balance due",
      amount: amount(closing),
      tone: "balance",
      emphasis: true,
    },
  ];
  return { summary, rows };
}
