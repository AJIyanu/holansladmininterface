"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  cashFormSchema,
  type CashFormValues,
} from "@/features/cash-book/schema";
import { mutateCashBook } from "@/features/cash-book/actions";
import { money, type CashEntry } from "@/features/cash-book/types";

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function EntryForm({ entry }: { entry?: CashEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const form = useForm<CashFormValues>({
    resolver: zodResolver(cashFormSchema),
    defaultValues: {
      date:
        entry?.date ??
        new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }),
      kind: entry?.kind ?? "RECEIPT",
      amount: entry?.amount ?? "",
      description: entry?.description ?? "",
      reference: entry?.reference ?? "",
      reason: "",
    },
  });
  function save(values: CashFormValues) {
    if (entry && !values.reason.trim()) {
      form.setError("reason", { message: "Explain the correction." });
      return;
    }
    const payload = JSON.stringify(values);
    if (submission.current?.payload !== payload)
      submission.current = { payload, key: crypto.randomUUID() };
    const key = submission.current.key;
    setMessage("");
    startTransition(async () => {
      try {
        const result = await mutateCashBook(
          entry
            ? {
                operation: "edit",
                id: entry.id,
                version: entry.version,
                values,
              }
            : { operation: "create", request_key: key, values },
        );
        if (!result.success) {
          setMessage(result.message);
          return;
        }
        toast.success(result.message);
        submission.current = null;
        setOpen(false);
        if (!entry) form.reset();
        router.refresh();
      } catch {
        setMessage("Unable to save. Please try again.");
      }
    });
  }
  const error = (field: keyof CashFormValues) =>
    form.formState.errors[field]?.message;
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={entry ? "outline" : "default"}
          size={entry ? "sm" : "default"}
        >
          {entry ? "Edit" : "Add entry"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Correct cash-book entry" : "Add cash-book entry"}
          </DialogTitle>
          <DialogDescription>
            NGN cash book. Both sides of the journal are recorded automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            void form.handleSubmit(save)(event);
          }}
        >
          <fieldset disabled={pending} className="space-y-4">
            <label className="block space-y-1">
              <span>Entry type</span>
              <select className={selectClass} {...form.register("kind")}>
                <option value="RECEIPT">Money in — cash income (debit)</option>
                <option value="EXPENSE">Money out — expense (credit)</option>
                <option value="CAPITAL">
                  Money in — capital introduced (debit)
                </option>
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              Use capital introduced for owner funding. Money in recorded as
              cash income credits the income account.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span>Date</span>
                <Input
                  type="date"
                  {...form.register("date")}
                  aria-invalid={!!error("date")}
                />
                <span className="text-sm text-destructive">
                  {error("date")}
                </span>
              </label>
              <label className="block space-y-1">
                <span>Amount (NGN)</span>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  {...form.register("amount")}
                  aria-invalid={!!error("amount")}
                />
                <span className="text-sm text-destructive">
                  {error("amount")}
                </span>
              </label>
            </div>
            <label className="block space-y-1">
              <span>Description</span>
              <Input
                maxLength={500}
                {...form.register("description")}
                aria-invalid={!!error("description")}
              />
              <span className="text-sm text-destructive">
                {error("description")}
              </span>
            </label>
            <label className="block space-y-1">
              <span>Reference (optional)</span>
              <Input maxLength={100} {...form.register("reference")} />
              <span className="text-sm text-destructive">
                {error("reference")}
              </span>
            </label>
            {entry && (
              <label className="block space-y-1">
                <span>Reason for correction</span>
                <Input
                  maxLength={500}
                  {...form.register("reason")}
                  aria-invalid={!!error("reason")}
                />
                <span className="text-sm text-destructive">
                  {error("reason")}
                </span>
                <span className="block text-sm text-muted-foreground">
                  The original journal entry is retained and reversed.
                </span>
              </label>
            )}
          </fieldset>
          {message && (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || (!!entry && !form.formState.isDirty)}
            >
              {pending ? "Saving…" : "Save entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VoidEntry({ entry }: { entry: CashEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Void this entry?</DialogTitle>
          <DialogDescription>
            Remove {money(entry.amount)} from the cash book. The original entry
            and a reversal remain in the journal.
          </DialogDescription>
        </DialogHeader>
        <p className="break-words">{entry.description}</p>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            startTransition(async () => {
              try {
                const result = await mutateCashBook({
                  operation: "delete",
                  id: entry.id,
                  version: entry.version,
                  reason,
                });
                if (!result.success) {
                  setMessage(result.message);
                  return;
                }
                toast.success(result.message);
                setOpen(false);
                router.refresh();
              } catch {
                setMessage("Unable to void this entry. Please try again.");
              }
            });
          }}
        >
          <label className="block space-y-1">
            <span>Reason for deletion</span>
            <Input
              required
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={pending}
            />
          </label>
          {message && (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Keep entry
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending || !reason.trim()}
            >
              {pending ? "Voiding…" : "Confirm deletion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
