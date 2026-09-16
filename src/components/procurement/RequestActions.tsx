"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  entities,
  text,
  formatHumanValue,
  type Entity,
} from "@/features/procurement/types";

function useMutation() {
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);
  return async (path: string, method: string, payload: unknown) => {
    const body = JSON.stringify(payload);
    const fingerprint = `${method}:${path}:${body}`;
    if (retry.current?.fingerprint !== fingerprint)
      retry.current = { fingerprint, key: crypto.randomUUID() };
    const response = await fetch(`/api/procurement/${path}/`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": retry.current.key,
      },
      body,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const messages =
        error && typeof error === "object"
          ? Object.values(error)
              .flat()
              .filter((value) => typeof value === "string")
          : [];
      throw new Error(messages.join(" ") || "Unable to save. Please retry.");
    }
  };
}

export function SubmitRequestButton({ request }: { request: Entity }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const mutate = useMutation();
  const router = useRouter();
  async function submit() {
    setPending(true);
    setError("");
    try {
      await mutate(`requests/${request.id}/submit`, "POST", {
        expected_version: request.version,
      });
      setOpen(false);
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Unable to submit.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div>
        <h2 className="font-semibold">Ready to submit?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and edit the draft items below before starting sourcing and
          purchasing.
        </p>
      </div>
      <Button onClick={() => setOpen(true)}>Submit client request</Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!pending) setOpen(value);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review client request</DialogTitle>
            <DialogDescription>
              Submitting starts the operational workflow and locks these item
              details against direct editing.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
            {[
              ["Client", request.client_name],
              ["Request", request.number],
              ["Received", request.received_at],
              ["Notes", request.notes],
            ].map(([name, value]) => (
              <div key={String(name)}>
                <dt className="text-sm text-muted-foreground">
                  {String(name)}
                </dt>
                <dd className="break-words whitespace-pre-wrap">
                  {formatHumanValue(value)}
                </dd>
              </div>
            ))}
          </dl>
          {entities(request.items).map((item, index) => (
            <article key={item.id} className="space-y-2 rounded-lg border p-4">
              <h3 className="font-semibold">
                Item {index + 1}: {text(item.description)}
              </h3>
              <p>
                {text(item.quantity)} {text(item.unit)}
              </p>
              {Boolean(item.specification) && (
                <p className="whitespace-pre-wrap">
                  {text(item.specification)}
                </p>
              )}
              {Boolean(item.required_date) && (
                <p>Required: {text(item.required_date)}</p>
              )}
            </article>
          ))}
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Edit
            </Button>
            <Button disabled={pending} onClick={() => void submit()}>
              {pending ? "Submitting…" : "Confirm and submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const itemSchema = z.object({
  description: z.string().trim().min(1, "Description is required."),
  specification: z.string(),
  quantity: z
    .string()
    .regex(
      /^\d+(\.\d{1,4})?$/,
      "Enter a quantity with up to four decimal places.",
    )
    .refine(
      (value) => Number(value) > 0,
      "Quantity must be greater than zero.",
    ),
  unit: z.string().trim().min(1, "Unit is required.").max(40),
  required_date: z.string(),
});
type ItemValues = z.infer<typeof itemSchema>;
export function EditRequestItem({
  item,
  requestVersion,
}: {
  item: Entity;
  requestVersion: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const mutate = useMutation();
  const router = useRouter();
  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      description: String(item.description || ""),
      specification: String(item.specification || ""),
      quantity: String(item.quantity || ""),
      unit: String(item.unit || ""),
      required_date: String(item.required_date || ""),
    },
  });
  async function save(values: ItemValues) {
    setError("");
    try {
      await mutate(`items/${item.id}`, "PATCH", {
        ...values,
        required_date: values.required_date || null,
        expected_version: requestVersion,
      });
      setOpen(false);
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Unable to update item.",
      );
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Edit item
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!form.formState.isSubmitting) setOpen(value);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit request item</DialogTitle>
            <DialogDescription>
              Update this draft item. Your changes are recorded in its history.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => void form.handleSubmit(save)(event)}
          >
            {(
              [
                ["description", "Description"],
                ["specification", "Specification"],
                ["quantity", "Quantity"],
                ["unit", "Unit"],
                ["required_date", "Required date"],
              ] as const
            ).map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`${item.id}-${name}`}>{label}</Label>
                {name === "specification" ? (
                  <Textarea
                    id={`${item.id}-${name}`}
                    {...form.register(name)}
                  />
                ) : (
                  <Input
                    id={`${item.id}-${name}`}
                    {...form.register(name)}
                    type={name === "required_date" ? "date" : "text"}
                    inputMode={name === "quantity" ? "decimal" : undefined}
                  />
                )}
                {form.formState.errors[name] && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting ? "Updating…" : "Update item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
