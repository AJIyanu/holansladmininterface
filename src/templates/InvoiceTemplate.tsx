import Image from "next/image";
import type { Invoice } from "@/features/sales-invoice/types";
import { money } from "@/features/cash-book/types";
import {
  decimal,
  vatAmount,
  lineAmount,
} from "@/features/sales-invoice/schema";
import { quantityLabel, quantityNumber } from "@/features/sales-invoice/units";

/** Client-facing layout converted from the supplied invoice.html. */
export function InvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const subtotal = BigInt(invoice.subtotal.replace(".", ""));
  const vat = vatAmount(subtotal, invoice.tax_rate ?? "7.5");
  const fmt = (value: string) => money(value, invoice.currency);
  const company = invoice.company;
  const pricing = invoice.pricing;
  const discounted = Number(pricing?.discount_percent ?? "0") > 0;
  const totals = [
    ["Sub-total", pricing?.gross_subtotal ?? invoice.subtotal],
    ...(discounted && pricing
      ? [
          [
            `Discount (${quantityNumber(pricing.discount_percent)}%)`,
            pricing.discount_amount,
          ],
          ["Net subtotal", invoice.subtotal],
        ]
      : []),
    [`VAT (${invoice.tax_rate ?? "7.5"}%)`, decimal(vat)],
    ["TOTAL", decimal(subtotal + vat)],
  ];
  return (
    <section
      aria-label="Invoice preview"
      className="mx-auto w-full max-w-[800px] rounded border bg-white px-4 py-10 text-sm text-gray-800 shadow-md sm:px-11"
    >
      <header className="mb-6 flex justify-end text-right">
        <div>
          <Image
            src="/HolanSL_logo_Full_color_Horizontal.webp"
            alt="Holan Integrated Services Limited"
            width={180}
            height={70}
            className="mb-3 ml-auto h-auto w-[180px]"
          />
          <div className="text-xs leading-relaxed">
            {company?.website && (
              <p className="font-semibold">Website: {company.website}</p>
            )}
            {company?.email && <p>Email: {company.email}</p>}
            <p>WhatsApp: {company?.phone || "2348073033767, 2348090964567"}</p>
            <p>
              24, Damin Plaza, MKO Abiola Way, Ringroad, Ibadan, Oyo, Nigeria.
            </p>
          </div>
        </div>
      </header>
      <h2 className="mb-7 text-right text-[28px] font-bold tracking-wide">
        INVOICE
      </h2>
      <div className="mb-7 break-words leading-relaxed">
        <p>
          <strong>Billed to:</strong>
        </p>
        <p className="whitespace-pre-wrap">{invoice.billed_to}</p>
        {invoice.billing_address && (
          <p className="whitespace-pre-wrap">{invoice.billing_address}</p>
        )}
        <p>
          <strong className="inline-block min-w-[95px]">Date:</strong>{" "}
          {invoice.date}
        </p>
        <p>
          <strong className="inline-block min-w-[95px]">Invoice No:</strong>{" "}
          {invoice.reference ?? "Draft — not valid for issue"}
        </p>
      </div>
      <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th scope="col" className="w-[9%] p-2 text-left">
              S/N
            </th>
            <th scope="col" className="w-[34%] p-2 text-left">
              ITEMS
            </th>
            <th scope="col" className="w-[21%] p-2 text-right">
              PRICE
            </th>
            <th scope="col" className="w-[15%] p-2 text-right">
              QTY
            </th>
            <th scope="col" className="w-[21%] p-2 text-right">
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr
              key={item.id ?? index}
              className="border-b border-gray-200 align-top [&>td]:break-words [&>td]:px-2 [&>td]:py-3.5"
            >
              <td>{item.position ?? index + 1}</td>
              <td className="whitespace-pre-wrap">{item.description}</td>
              <td className="text-right">{fmt(item.unit_price)}</td>
              <td className="text-right">
                {quantityLabel(item.quantity, item.unit)}
              </td>
              <td className="text-right">
                {fmt(
                  discounted
                    ? decimal(lineAmount(item))
                    : (item.amount ?? "0.00"),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto w-full max-w-80">
        {totals.map(([label, value]) => (
          <div
            key={label}
            className={`flex justify-between gap-3 px-3.5 py-2.5 ${label === "TOTAL" ? "bg-primary font-bold text-primary-foreground" : "border-b border-gray-200 bg-gray-100"}`}
          >
            <dt>{label}</dt>
            <dd className="break-words text-right font-semibold">
              {label.startsWith("Discount") ? "−" : ""}
              {fmt(value)}
            </dd>
          </div>
        ))}
      </dl>
      {invoice.notes && (
        <p className="mt-6 whitespace-pre-wrap break-words">{invoice.notes}</p>
      )}
      <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs text-gray-600">
        {["For the client", "For Holan Mgt"].map((label) => (
          <div key={label}>
            <div className="mx-auto mb-2 w-full max-w-56 border-t border-gray-600" />
            <p>{label}</p>
            <p>Signature and Date</p>
          </div>
        ))}
      </div>
    </section>
  );
}
