import Image from "next/image";
import { money } from "@/features/cash-book/types";
import {
  statementDate,
  type SummaryLine,
  type PrintRow,
} from "@/features/reconciliation/presentation";
import styles from "./ReconciliationTemplate.module.css";
export function ReconciliationTemplate({
  name,
  start,
  end,
  currency,
  company,
  summary,
  rows,
  receivedLabel = "Received",
  chargedLabel = "Invoiced",
  referenceLabel = "Invoice / Receipt number",
  note,
}: {
  name: string;
  start: string;
  end: string;
  currency: string;
  company: Record<string, unknown>;
  summary: SummaryLine[];
  rows: PrintRow[];
  receivedLabel?: string;
  chargedLabel?: string;
  referenceLabel?: string;
  note?: string;
}) {
  const text = (key: string, fallback: string) =>
    typeof company[key] === "string" && company[key]
      ? String(company[key])
      : fallback;
  return (
    <article
      className={styles.document}
      aria-label="Reconciliation statement of account"
    >
      <header className={styles.header}>
        <Image
          className={styles.logo}
          src="/HolanSL_logo_Full_color_Horizontal.webp"
          alt="Holan Integrated Services Limited"
          width={200}
          height={78}
          priority
        />
        <div className={styles.contacts}>
          <div>Website: {text("website", "www.holansl.com")}</div>
          <div>Email: {text("email", "operations@holansl.com")}</div>
          <div>WhatsApp: {text("phone", "2348073033767, 2348090964567")}</div>
          <div>
            24, Damin Plaza, MKO Abiola Way, Ringroad, Ibadan, Oyo, Nigeria.
          </div>
        </div>
        <h1 className={styles.title}>
          RECONCILIATION STATEMENT OF ACCOUNT BETWEEN
          <br />
          HOLAN INT. SERVICES LTD. AND {name}
          <br />
          {statementDate(start)} - {statementDate(end)}
        </h1>
        <p className={styles.currency}>Currency: {currency}</p>
      </header>
      <dl className={styles.summary}>
        {summary.map((line) => (
          <div
            key={line.label}
            className={`${styles.summaryRow} ${styles[line.tone]} ${line.emphasis && line.tone !== "balance" ? styles.emphasis : ""}`}
          >
            <dt>{line.label}</dt>
            <dd>{money(line.amount, currency)}</dd>
          </div>
        ))}
      </dl>
      <table className={styles.table}>
        <thead>
          <tr>
            {[
              "Date",
              "Description",
              referenceLabel,
              chargedLabel,
              receivedLabel,
            ].map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={styles[row.tone]}>
              <td>{statementDate(row.date)}</td>
              <td>{row.description}</td>
              <td>{row.reference || "—"}</td>
              <td>
                {row.charged !== "0.00" ? money(row.charged, currency) : "—"}
              </td>
              <td>
                {row.received !== "0.00" ? money(row.received, currency) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className={styles.empty}>No transactions in the selected period.</p>
      )}
      {note && <p className={styles.note}>{note}</p>}
    </article>
  );
}
