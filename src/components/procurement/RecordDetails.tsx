import Link from "next/link";
import { EditRequestItem } from "./RequestActions";
import {
  entities,
  text,
  label,
  formatHumanValue,
  fieldDisplay,
  type Entity,
} from "@/features/procurement/types";
const links: Record<string, string> = {
  request: "requests",
  item: "items",
  previous_item: "items",
  quotation: "quotations",
  quotation_revision: "quotation-revisions",
  revision: "quotation-revisions",
  register: "document-register",
  purchase: "supplier-purchases",
  delivery: "deliveries",
  attempt: "attempts",
  replaces: "outcome-lines",
  document: "documents",
  waybill: "documents",
  signed_waybill: "documents",
  task: "/dashboard/tasks",
};
const names: Record<string, string> = {
  created_by_name: "Recorded by",
  created_at: "Recorded at",
  request: "Client request",
  kind: "Type",
  client_code: "Client document code",
  number: "Reference number",
  submitted_at: "Submitted",
  dispatched_at: "Dispatched",
};
function value(record: Entity, key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (links[key] && typeof value === "string") {
    const root = links[key].startsWith("/")
      ? links[key]
      : `/dashboard/procurement/${links[key]}`;
    return (
      <Link className="text-primary underline" href={`${root}/${value}`}>
        {fieldDisplay(record, key)}
      </Link>
    );
  }
  if (typeof value === "string" && /^\d{4}-\d\d-\d\dT/.test(value))
    return formatHumanValue(value);
  return formatHumanValue(value);
}
export function RecordDetails({ record }: { record: Entity }) {
  const hidden = new Set([
    "id",
    "created_by",
    "client",
    "owner",
    "department",
    "contact",
    "supplier",
    "recipient",
    "receiver",
    "ledger_reference",
    "approval_requested_by",
    "display_label",
    "display_reference",
    "related_labels",
  ]);
  return (
    <dl className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(record)
        .filter(
          ([key, val]) =>
            !hidden.has(key) &&
            !Array.isArray(val) &&
            (val === null || typeof val !== "object"),
        )
        .map(([key, val]) => (
          <div key={key} className="min-w-0">
            <dt className="text-sm capitalize text-muted-foreground">
              {names[key] || key.replaceAll("_", " ")}
            </dt>
            <dd className="mt-1 break-words whitespace-pre-wrap font-medium">
              {value(record, key, val)}
            </dd>
          </div>
        ))}
    </dl>
  );
}
export function NestedRecords({
  record,
  resource,
  canEditItems = false,
}: {
  record: Entity;
  resource: string;
  canEditItems?: boolean;
}) {
  const destinations: Record<string, string> = {
    items: "items",
    versions: "document-versions",
    revisions: "quotation-revisions",
    issues: "quotation-revisions",
    assets: "documents",
  };
  return (
    <div className="space-y-5">
      {["items", "lines", "revisions", "versions", "assets", "issues"].map(
        (key) => {
          const rows = entities(record[key]);
          if (!rows.length) return null;
          return (
            <section key={key} className="space-y-3">
              <h2 className="font-heading text-xl font-semibold capitalize">
                {key.replaceAll("_", " ")}
              </h2>
              {rows.map((row, index) => (
                <div key={row.id} className="space-y-3">
                  <h3 className="font-medium">
                    {destinations[key] && key !== "assets" ? (
                      <Link
                        className="text-primary underline"
                        href={`/dashboard/procurement/${destinations[key]}/${row.id}`}
                      >
                        {label(row)}
                      </Link>
                    ) : (
                      `${key === "lines" ? "Line" : "Record"} ${index + 1}`
                    )}
                  </h3>
                  {key === "items" &&
                    resource === "requests" &&
                    !record.submitted_at &&
                    canEditItems && (
                      <EditRequestItem
                        key={`${row.id}-${record.version}`}
                        item={row}
                        requestVersion={Number(record.version)}
                      />
                    )}
                  {key === "items" &&
                    resource === "requests" &&
                    Boolean(record.submitted_at) && (
                      <p className="text-sm text-muted-foreground">
                        Submitted item · direct editing is locked.
                      </p>
                    )}
                  <RecordDetails record={row} />
                  {key === "lines" &&
                    resource === "delivery-outcomes" &&
                    Number(row.rejected) > 0 && (
                      <Link
                        className="inline-block text-primary underline"
                        href={`/dashboard/procurement/outcome-lines/${row.id}`}
                      >
                        Resolve rejected quantity
                      </Link>
                    )}
                  {key === "assets" && (
                    <Link
                      className="text-primary underline"
                      href={`/api/procurement/documents/${row.document}/download/`}
                    >
                      Download {text(row.filename)}
                    </Link>
                  )}
                </div>
              ))}
            </section>
          );
        },
      )}
    </div>
  );
}
