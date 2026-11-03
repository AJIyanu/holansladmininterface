import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type BookSearch = Record<string, string | string[] | undefined>;
export function bookQuery(search: BookSearch) {
  const query = new URLSearchParams();
  for (const key of ["year", "date_from", "date_to", "page"]) {
    const value = search[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  if (!query.has("year"))
    query.set(
      "year",
      new Intl.DateTimeFormat("en", {
        timeZone: "Africa/Lagos",
        year: "numeric",
      }).format(new Date()),
    );
  return query;
}
export function BookFilters({ query }: { query: URLSearchParams }) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <label className="space-y-1">
        <span className="text-sm font-medium">Financial year</span>
        <Input
          name="year"
          type="number"
          min="1"
          max="9999"
          required
          defaultValue={query.get("year") ?? ""}
          className="w-28"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">From (optional)</span>
        <Input
          name="date_from"
          type="date"
          defaultValue={query.get("date_from") ?? ""}
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">To (optional)</span>
        <Input
          name="date_to"
          type="date"
          defaultValue={query.get("date_to") ?? ""}
        />
      </label>
      <Button type="submit">Apply</Button>
      <p className="basis-full text-sm text-muted-foreground">
        Financial year: January 1–December 31. Dates must fall within the
        selected year.
      </p>
    </form>
  );
}
export function BookPagination({
  query,
  count,
  previous,
  next,
  pathname,
}: {
  query: URLSearchParams;
  count: number;
  previous: string | null;
  next: string | null;
  pathname: string;
}) {
  const page = Number(query.get("page") ?? "1");
  const href = (number: number) => {
    const value = new URLSearchParams(query);
    value.set("page", String(number));
    return `${pathname}?${value}`;
  };
  return (
    <nav
      aria-label="Record pages"
      className="flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <span>
        {count} records · Page {page}
      </span>
      <div className="flex gap-3">
        {previous && (
          <Link
            className="rounded-md border px-3 py-2 hover:bg-muted"
            href={href(page - 1)}
          >
            Previous
          </Link>
        )}
        {next && (
          <Link
            className="rounded-md border px-3 py-2 hover:bg-muted"
            href={href(page + 1)}
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
