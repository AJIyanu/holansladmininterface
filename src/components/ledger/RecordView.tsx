import Link from "next/link";
export function RecordView({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span>—</span>;
  if (typeof value !== "object")
    return (
      <span className="break-words">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
      </span>
    );
  if (Array.isArray(value))
    return (
      <div className="space-y-3">
        {value.map((row, i) => (
          <div key={i} className="rounded-lg border p-3">
            <RecordView value={row} />
          </div>
        ))}
      </div>
    );
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {Object.entries(value)
        .filter(
          ([key]) =>
            ![
              "id",
              "fingerprint",
              "checksum",
              "snapshot_hash",
              "version",
            ].includes(key) &&
            (!key.endsWith("_id") || key === "evidence_id"),
        )
        .map(([key, v]) => (
          <div
            key={key}
            className={
              typeof v === "object" ? "min-w-0 sm:col-span-2" : "min-w-0"
            }
          >
            <dt className="text-sm capitalize text-muted-foreground">
              {key.replaceAll("_", " ")}
            </dt>
            <dd className="mt-1">
              {key === "evidence_id" && typeof v === "string" ? (
                <Link
                  className="text-primary underline"
                  href={`/api/ledger/documents/${v}/download/`}
                >
                  Download supporting document
                </Link>
              ) : (
                <RecordView value={v} />
              )}
            </dd>
          </div>
        ))}
    </dl>
  );
}
