"use client";

import { LedgerSelect } from "@/components/ledger/FormControls";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  cashBookToday,
  cashFormSchema,
  type CashFormValues,
} from "@/features/cash-book/schema";
import { mutateCashBook } from "@/features/cash-book/actions";
import { money, type CashEntry } from "@/features/cash-book/types";

export function EntryForm({
  entry,
  accounts = [],
}: {
  entry?: CashEntry;
  accounts?: Array<{
    id: string;
    name: string;
    kind: string;
    currency: string;
    is_active: boolean;
  }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const form = useForm<CashFormValues>({
    resolver: zodResolver(cashFormSchema),
    defaultValues: {
      account: entry?.account ?? "00000000-0000-4000-8000-000000000001",
      currency: (entry?.currency ?? "NGN") as "NGN" | "USD" | "GBP",
      date: entry?.date ?? cashBookToday(),
      kind: entry?.kind ?? "RECEIPT",
      amount: entry?.amount ?? "",
      description: entry?.description ?? "",
      reference: entry?.reference ?? "",
      reason: "",
    },
  });
  const selectedAccount = useWatch({ control: form.control, name: "account" });
  const selectedCurrency = useWatch({
    control: form.control,
    name: "currency",
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {!entry && (
          <label>
            Cash / bank account
            <LedgerSelect
              className="w-full min-w-48"
              value={selectedAccount}
              onChange={(e) => {
                const account = accounts.find((a) => a.id === e.target.value);
                form.setValue("account", e.target.value);
                form.setValue(
                  "currency",
                  account?.currency as "NGN" | "USD" | "GBP",
                );
              }}
            >
              {accounts
                .filter((a) => a.is_active)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.kind} · {a.currency}
                  </option>
                ))}
            </LedgerSelect>
          </label>
        )}
        <DialogHeader>
          <DialogTitle>
            {entry ? "Correct cash-book entry" : "Add cash-book entry"}
          </DialogTitle>
          <DialogDescription>
            {selectedCurrency ?? "NGN"} cash book. Both sides of the journal are
            recorded automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            void form.handleSubmit(save)(event);
          }}
        >
          <fieldset disabled={pending} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="cash-entry-kind">Entry type</label>
              <Controller
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={pending}
                  >
                    <SelectTrigger
                      id="cash-entry-kind"
                      ref={field.ref}
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEIPT">
                        Money in — cash income (debit)
                      </SelectItem>
                      <SelectItem value="EXPENSE">
                        Money out — expense (credit)
                      </SelectItem>
                      <SelectItem value="CAPITAL">
                        Money in — capital introduced (debit)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Use capital introduced for owner funding. Money in recorded as
              cash income credits the income account.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="cash-entry-date">Date</label>
                <Controller
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          id="cash-entry-date"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          disabled={pending}
                          aria-invalid={!!error("date")}
                          aria-describedby="cash-entry-date-error"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value
                            ? format(parseISO(field.value), "dd MMM yyyy")
                            : "Choose a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-[22rem] max-w-[calc(100vw-2rem)] p-0"
                      >
                        <Calendar
                          className="w-full [--cell-size:2.5rem]"
                          mode="single"
                          selected={
                            field.value ? parseISO(field.value) : undefined
                          }
                          defaultMonth={
                            field.value ? parseISO(field.value) : undefined
                          }
                          today={parseISO(cashBookToday())}
                          disabled={{ after: parseISO(cashBookToday()) }}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setDateOpen(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <p
                  id="cash-entry-date-error"
                  className="text-sm text-destructive"
                >
                  {error("date")}
                </p>
              </div>
              <label className="block space-y-1">
                <span>Amount ({selectedCurrency ?? "NGN"})</span>
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
            Remove {money(entry.amount, entry.currency)} from the cash book. The
            original entry and a reversal remain in the journal.
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
