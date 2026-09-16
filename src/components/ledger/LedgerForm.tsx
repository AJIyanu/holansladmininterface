"use client";
import { useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProcurementDatePicker } from "@/components/procurement/DatePicker";
import { Lookup } from "./Lookup";
import {
  type Field,
  type FormDefinition,
  type Access,
  text,
} from "@/features/procurement/types";
type Values = FieldValues;
function validationShape(fields: Field[]) {
  return Object.fromEntries(
    fields.map((field) => {
      let schema: z.ZodType =
        field.type === "boolean"
          ? z.boolean()
          : field.type === "file"
            ? z.custom<File>(
                (value) =>
                  value instanceof File &&
                  value.size > 0 &&
                  value.size <= 20 * 1024 * 1024,
                "Choose a file up to 20 MiB.",
              )
            : z.string();
      if (field.required && field.type !== "boolean" && field.type !== "file")
        schema = z.string().trim().min(1, `${field.label} is required.`);
      if (field.type === "decimal")
        schema = z
          .string()
          .refine(
            (value) =>
              (!value && !field.required) || /^\d+(\.\d{1,4})?$/.test(value),
            "Enter a nonnegative number with up to four decimal places.",
          )
          .refine(
            (value) =>
              !value || field.max === undefined || Number(value) <= field.max,
            `${field.label} cannot exceed ${field.max}.`,
          );
      if (!field.required && field.type !== "boolean")
        schema = schema.nullish().transform((value) => value ?? "");
      return [field.name, schema];
    }),
  );
}
function validation(fields: Field[]) {
  return z.object(validationShape(fields)).superRefine((values, context) => {
    if (
      values.discount_type === "PERCENT" &&
      Number(values.discount_value || 0) > 100
    )
      context.addIssue({
        code: "custom",
        path: ["discount_value"],
        message: "Percentage discount cannot exceed 100%.",
      });
  });
}
function defaults(fields: Field[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.defaultValue ?? (field.type === "boolean" ? false : ""),
    ]),
  );
}
export function LedgerForm({
  definition,
  requestId,
  initial = {},
}: {
  definition: FormDefinition;
  requestId?: string;
  user: Access;
  initial?: Values;
}) {
  const router = useRouter();
  const [review, setReview] = useState(false);
  const [files, setFiles] = useState<{ id: string; filename: string }[]>([]);
  const [lookupLabels, setLookupLabels] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const submission = useRef<{ fingerprint: string; key: string } | null>(null);
  const fields = definition.fields;
  const schema = definition.lines
    ? z.object(validationShape(fields)).extend({
        [definition.lines.name]: z
          .array(validation(definition.lines.fields))
          .min(1, "Add at least one item."),
      })
    : validation(fields);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaults(fields),
      ...(definition.lines
        ? { [definition.lines.name]: [defaults(definition.lines.fields)] }
        : {}),
      ...Object.fromEntries(
        Object.entries(initial).map(([key, value]) => [
          key,
          typeof value === "number" ? String(value) : value,
        ]),
      ),
      ...(requestId && fields.some((field) => field.name === "request")
        ? { request: requestId }
        : {}),
    },
  });
  const watched = useWatch({ control: form.control });
  const activeRequest = String(watched.request || requestId || "");
  const rows = useFieldArray({
    control: form.control,
    name: (definition.lines?.name || "_unused") as
      "lines" | "items" | "_unused",
  });
  function clean(data: Values, definitions: Field[]) {
    return Object.fromEntries(
      definitions.flatMap((field) => {
        const value = data[field.name];
        if (value === "" || value === undefined || value === null) return [];
        return [
          [
            field.name,
            field.type === "datetime"
              ? new Date(String(value)).toISOString()
              : value,
          ],
        ];
      }),
    );
  }
  async function submit(data: Values) {
    if (!review) {
      setReview(true);
      setError("");
      return;
    }
    const body: Values = clean(data, fields);
    if (definition.lines)
      body[definition.lines.name] = (
        data[definition.lines.name] as Values[]
      ).map((row) => clean(row, definition.lines!.fields));
    const fingerprint = JSON.stringify(body, (_key, value) =>
      value instanceof File
        ? { name: value.name, size: value.size, modified: value.lastModified }
        : value,
    );
    if (submission.current?.fingerprint !== fingerprint)
      submission.current = { fingerprint, key: crypto.randomUUID() };
    setError("");
    try {
      const multipart = body.file instanceof File;
      const headers: Record<string, string> = {
        "Idempotency-Key": submission.current!.key,
      };
      let payload: BodyInit;
      if (multipart) {
        const data = new FormData();
        for (const [key, value] of Object.entries(body))
          data.append(key, value instanceof File ? value : String(value));
        payload = data;
      } else {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
      }
      const response = await fetch(
        `/api/ledger/${definition.endpoint.replace(/\/edit$/, "")}/`,
        {
          method: definition.endpoint.endsWith("/edit") ? "PATCH" : "POST",
          headers,
          body: payload,
        },
      );
      const result = await response.json();
      if (!response.ok) {
        const messages: string[] = [];
        const collect = (value: unknown, path = "") => {
          if (typeof value === "string") {
            messages.push(value);
            if (path && path !== "detail")
              form.setError(path, { message: value });
          } else if (value && typeof value === "object") {
            for (const [key, entry] of Object.entries(value)) {
              collect(
                entry,
                Array.isArray(value) && typeof entry === "string"
                  ? path
                  : path
                    ? `${path}.${key}`
                    : key,
              );
            }
          }
        };
        collect(result);
        throw new Error(messages.join(" ") || "Unable to save this record.");
      }
      toast.success("Saved successfully");
      if (result.documents) {
        setFiles(result.documents);
        setReview(false);
        return;
      }

      const target =
        definition.endpoint === "__unused"
          ? `quotation-revisions/${result.id}`
          : definition.endpoint === "document-versions"
            ? `document-versions/${result.id}`
            : definition.destination.includes("/")
              ? definition.destination
              : `${definition.destination}/${result.id}`;
      router.push(`/dashboard/ledger/${target}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save. Retry the same submission.",
      );
    }
  }
  function summary(definitions: Field[], values: Values, prefix = "") {
    return (
      <dl className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
        {definitions
          .filter((field) => field.name !== "expected_version")
          .map((field) => {
            const value = values[field.name];
            const display =
              field.type === "lookup"
                ? value
                  ? lookupLabels[prefix + field.name] || text(value)
                  : "Not selected"
                : field.type === "file"
                  ? value instanceof File
                    ? value.name
                    : "No file"
                  : field.type === "boolean"
                    ? value
                      ? "Yes"
                      : "No"
                    : text(value || "Not provided");
            return (
              <div key={field.name}>
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="mt-1 break-words whitespace-pre-wrap font-medium">
                  {display}
                </dd>
              </div>
            );
          })}
      </dl>
    );
  }
  const renderField = (field: Field, name = field.name) => (
    <Controller
      key={name}
      name={name}
      control={form.control}
      render={({ field: binding, fieldState }) => (
        <div
          className={
            field.name === "expected_version" ||
            (field.name === "target" &&
              ["CLIENT", "CLIENT_REFUND"].includes(String(watched.purpose)))
              ? "hidden"
              : field.type === "textarea"
                ? "space-y-2 md:col-span-2"
                : "space-y-2"
          }
        >
          <Label htmlFor={name}>
            {field.label}
            {field.required && " *"}
          </Label>
          {field.type === "lookup" ? (
            <Lookup
              label={field.label}
              triggerId={name}
              triggerRef={binding.ref}
              onBlur={binding.onBlur}
              invalid={Boolean(fieldState.error)}
              onLabelChange={(value) =>
                setLookupLabels((current) =>
                  current[name] === value
                    ? current
                    : { ...current, [name]: value },
                )
              }
              resource={
                field.name === "target"
                  ? (
                      {
                        BILL: "supplier-bills",
                        EXPENSE: "expenses",
                        ADVANCE: "advances",
                        TAX_REMITTANCE: "tax-remittances",
                        ADVANCE_RETURN: "advances",
                        SUPPLIER_REFUND: "supplier-bills",
                      } as Record<string, string>
                    )[String(watched.purpose)] || field.resource!
                  : field.resource!
              }
              flatten={field.flatten}
              value={String(binding.value || "")}
              clientId={
                typeof watched.client === "string" ? watched.client : undefined
              }
              requestId={field.name === "request" ? undefined : activeRequest}
              onChange={(value) => {
                binding.onChange(value);
                setReview(false);
              }}
              disabled={form.formState.isSubmitting}
            />
          ) : field.type === "textarea" ? (
            <Textarea
              id={name}
              {...binding}
              value={String(binding.value || "")}
              onChange={(event) => {
                binding.onChange(event);
                setReview(false);
              }}
            />
          ) : field.type === "select" ? (
            <Select
              name={binding.name}
              value={String(binding.value || "")}
              disabled={form.formState.isSubmitting}
              onValueChange={(value) => {
                binding.onChange(value === "__clear__" ? "" : value);
                if (field.name === "purpose") form.setValue("target", "");
                setReview(false);
              }}
            >
              <SelectTrigger
                id={name}
                ref={binding.ref}
                onBlur={binding.onBlur}
                aria-invalid={Boolean(fieldState.error)}
                className="min-w-0"
              >
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)] backdrop-blur-md">
                <SelectItem value="__clear__">Clear selection</SelectItem>
                {field.options?.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="whitespace-normal break-words"
                  >
                    {option.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "date" ? (
            <ProcurementDatePicker
              id={name}
              value={String(binding.value || "")}
              onChange={(value) => {
                binding.onChange(value);
                setReview(false);
              }}
              onBlur={binding.onBlur}
              disabled={form.formState.isSubmitting}
              invalid={Boolean(fieldState.error)}
              disablePast={field.disablePast}
            />
          ) : field.type === "boolean" ? (
            <input
              id={name}
              type="checkbox"
              className="block h-5 w-5 accent-primary"
              checked={Boolean(binding.value)}
              onChange={(event) => {
                binding.onChange(event.target.checked);
                setReview(false);
              }}
            />
          ) : field.type === "file" ? (
            <Input
              id={name}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(event) => {
                binding.onChange(event.target.files?.[0]);
                setReview(false);
              }}
            />
          ) : (
            <Input
              id={name}
              {...binding}
              value={String(binding.value ?? "")}
              type={field.type === "datetime" ? "datetime-local" : "text"}
              inputMode={field.type === "decimal" ? "decimal" : undefined}
              onChange={(event) => {
                binding.onChange(event);
                setReview(false);
              }}
            />
          )}
          {field.help && (
            <p className="text-sm text-muted-foreground">{field.help}</p>
          )}
          {fieldState.error && (
            <p role="alert" className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
  if (files.length)
    return (
      <section className="space-y-4 rounded-xl border p-5">
        <h2 className="font-heading text-xl">Documents ready</h2>
        {files.map((file) => (
          <a
            className="block text-primary underline"
            key={file.id}
            href={`/api/ledger/documents/${file.id}/download/`}
          >
            {file.filename} — download / print
          </a>
        ))}
        <Button variant="outline" onClick={() => router.back()}>
          Back to record
        </Button>
      </section>
    );
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        void form.handleSubmit(submit)(event);
      }}
    >
      {definition.notice && (
        <p className="rounded-lg border border-info-border bg-info-subtle p-4 text-info-content">
          {definition.notice}
        </p>
      )}
      <div className="grid gap-5 rounded-xl border bg-card p-5 md:grid-cols-2">
        {fields.map((field) => renderField(field))}
      </div>
      {definition.lines && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold">
            {definition.lines.label}
          </h2>
          {rows.fields.map((row, index) => (
            <fieldset
              key={row.id}
              className="space-y-4 rounded-xl border bg-card p-5"
            >
              <legend className="px-2 font-semibold">Item {index + 1}</legend>
              <div className="grid gap-4 md:grid-cols-2">
                {definition.lines!.fields.map((field) =>
                  renderField(
                    field,
                    `${definition.lines!.name}.${index}.${field.name}`,
                  ),
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={
                  rows.fields.length === 1 || form.formState.isSubmitting
                }
                onClick={() => {
                  rows.remove(index);
                  setReview(false);
                }}
              >
                Remove item
              </Button>
            </fieldset>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              rows.append(defaults(definition.lines!.fields));
              setReview(false);
            }}
          >
            Add another item
          </Button>
        </section>
      )}
      <Dialog
        open={review}
        onOpenChange={(open) => {
          if (!form.formState.isSubmitting) setReview(open);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review before saving</DialogTitle>
            <DialogDescription>
              Check your entries. Confirm and save records this action under
              your staff identity.
            </DialogDescription>
          </DialogHeader>
          {watched.kind === "CLOSED_REJECTED" && (
            <p className="font-semibold text-destructive">
              This ends fulfilment for the selected rejected quantity.
            </p>
          )}
          {summary(fields, watched)}
          {definition.lines &&
            ((watched[definition.lines.name] as Values[]) || []).map(
              (row, index) => (
                <section
                  key={index}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <h3 className="font-semibold">Item {index + 1}</h3>
                  {summary(
                    definition.lines!.fields,
                    row,
                    `${definition.lines!.name}.${index}.`,
                  )}
                </section>
              ),
            )}
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={() => setReview(false)}
            >
              Edit
            </Button>
            <Button
              type="button"
              disabled={form.formState.isSubmitting}
              onClick={() => {
                void form.handleSubmit(submit, () => setReview(false))();
              }}
            >
              {form.formState.isSubmitting ? "Saving…" : "Confirm and save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive p-4 text-destructive"
        >
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Review
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={form.formState.isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
