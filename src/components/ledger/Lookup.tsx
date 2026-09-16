"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Access } from "@/features/procurement/types";
type Choice = { id: string; label: string };
export function Lookup(props: {
  resource: string;
  value?: string;
  onChange: (value: string, label?: string) => void;
  disabled?: boolean;
  requestId?: string;
  user?: Access;
  onLabelChange?: (label: string) => void;
  triggerId?: string;
  onBlur?: () => void;
  [key: string]: unknown;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Choice[]>([]);
  const [next, setNext] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true);
      setError("");
      try {
        const query = new URLSearchParams({
          kind: props.resource,
          search,
          page: String(page),
        });
        if (props.requestId) query.set("request", props.requestId);
        const res = await fetch(`/api/ledger/lookups/?${query}`, {
          signal: abort.signal,
        });
        if (!res.ok)
          throw Error(
            res.status === 403
              ? "You do not have permission to browse these records."
              : "Unable to load choices.",
          );
        const data = await res.json();
        setRows(data.results);
        setNext(Boolean(data.next));
      } catch (e) {
        if (!abort.signal.aborted)
          setError(e instanceof Error ? e.message : "Unable to load choices.");
      } finally {
        if (!abort.signal.aborted) setBusy(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [props.resource, props.requestId, search, page]);
  const onLabelChange = props.onLabelChange;
  useEffect(() => {
    const selected = rows.find((row) => row.id === props.value);
    if (selected) onLabelChange?.(selected.label);
  }, [rows, props.value, onLabelChange]);
  return (
    <div className="space-y-2">
      <Input
        aria-label="Search choices"
        placeholder="Search records…"
        value={search}
        disabled={props.disabled}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <select
        id={props.triggerId}
        onBlur={props.onBlur}
        aria-label="Select record"
        className="min-h-10 w-full rounded-md border bg-background p-2"
        value={props.value || ""}
        disabled={props.disabled || busy}
        onChange={(e) => {
          const label = rows.find((x) => x.id === e.target.value)?.label || "";
          setChosen(label);
          props.onLabelChange?.(label);
          props.onChange(e.target.value, label);
        }}
      >
        <option value="">Choose…</option>
        {props.value && !rows.some((x) => x.id === props.value) && (
          <option value={props.value}>{chosen || props.value}</option>
        )}
        {rows.map((x) => (
          <option key={x.id} value={x.id}>
            {x.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        {page > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
          >
            Previous choices
          </Button>
        )}
        {next && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
          >
            More choices
          </Button>
        )}
      </div>
    </div>
  );
}
