"use client";
import { useEffect, useId, useState, type Ref } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  entities,
  label,
  text,
  type Page,
  type Entity,
} from "@/features/procurement/types";
export function Lookup({
  resource,
  flatten,
  value,
  onChange,
  requestId,
  clientId,
  disabled,
  label: fieldLabel,
  triggerId,
  triggerRef,
  onBlur,
  invalid,
  onLabelChange,
}: {
  resource: string;
  flatten?: string;
  value: string;
  onChange: (value: string) => void;
  requestId?: string;
  clientId?: string;
  disabled?: boolean;
  label: string;
  triggerId?: string;
  triggerRef?: Ref<HTMLButtonElement>;
  onBlur?: () => void;
  invalid?: boolean;
  onLabelChange?: (label: string) => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{
    options: { id: string; label: string }[];
    next: boolean;
    error: string;
    key: string;
  }>({ options: [], next: false, error: "", key: "" });
  const requestKey = JSON.stringify([
    resource,
    flatten,
    requestId,
    clientId,
    search,
    page,
  ]);
  const loading = result.key !== requestKey;
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const [path, existing] = resource.split("?");
      const params = new URLSearchParams(existing);
      params.set("page", String(page));
      params.set("page_size", "30");
      if (search) params.set("search", search);
      if (clientId && params.get("kind") === "contacts")
        params.set("client", clientId);
      if (
        requestId &&
        (path !== "lookups" || params.get("kind") === "contacts")
      )
        params.set("request", requestId);
      fetch(`/api/procurement/${path}/?${params}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok)
            throw new Error(
              response.status === 403
                ? "You do not have permission to browse this directory."
                : "Could not load choices.",
            );
          return response.json() as Promise<Page<Entity>>;
        })
        .then((data) => {
          if (controller.signal.aborted) return;
          const options = data.results.flatMap((row) =>
            flatten
              ? entities(row[flatten]).map((child) => ({
                  id: child.id,
                  label: `${label(row)} · ${label(child)}${child.quantity ? ` · Qty ${text(child.quantity)}` : ""}`,
                }))
              : [{ id: row.id, label: label(row) }],
          );
          setResult({ options, next: !!data.next, error: "", key: requestKey });
        })
        .catch((error) => {
          if (!controller.signal.aborted)
            setResult({
              options: [],
              next: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Could not load choices.",
              key: requestKey,
            });
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [resource, flatten, requestId, clientId, search, page, requestKey]);
  const selectedLabel = result.options.find(
    (option) => option.id === value,
  )?.label;
  useEffect(() => {
    if (selectedLabel) onLabelChange?.(selectedLabel);
  }, [selectedLabel, onLabelChange]);
  return (
    <div
      className="space-y-3 rounded-lg border border-border p-3 md:p-4"
      aria-busy={loading}
    >
      <label className="sr-only" htmlFor={`${id}-search`}>
        Search {fieldLabel}
      </label>
      <Input
        id={`${id}-search`}
        placeholder={`Search ${fieldLabel.toLowerCase()}`}
        value={search}
        disabled={disabled}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />
      {loading && (
        <div
          role="status"
          aria-label={`Loading ${fieldLabel}`}
          className="space-y-2 py-1"
        >
          <span className="sr-only">Loading {fieldLabel}…</span>
          <Skeleton aria-hidden="true" className="h-10 w-full" />
          <Skeleton aria-hidden="true" className="h-3 w-2/3" />
        </div>
      )}
      {!loading && (
        <Select
          value={value}
          disabled={disabled}
          onValueChange={(selected) =>
            onChange(selected === "__clear__" ? "" : selected)
          }
        >
          <SelectTrigger
            id={triggerId || id}
            ref={triggerRef}
            onBlur={onBlur}
            aria-label={fieldLabel}
            aria-invalid={invalid}
            className="min-w-0"
          >
            <SelectValue placeholder="Select a record" />
          </SelectTrigger>
          <SelectContent className="max-w-[calc(100vw-2rem)] backdrop-blur-md">
            <SelectItem value="__clear__">Clear selection</SelectItem>
            {value && !result.options.some((option) => option.id === value) && (
              <SelectItem value={value}>
                Selected record · {value.slice(0, 8)}
              </SelectItem>
            )}
            {result.options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="whitespace-normal break-words"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {!loading && result.error && (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      )}
      <div className="flex gap-2">
        {!loading && page > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
          >
            Previous choices
          </Button>
        )}
        {!loading && result.next && (
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
