"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createItemRequest,
  getRequesterOptions,
  uploadItemImage,
} from "./actions";
import { itemRequestSchema, type ItemRequestValues } from "./schema";
import type { Option } from "./types";

const units = [
  "piece",
  "set",
  "pair",
  "box",
  "carton",
  "pack",
  "kilogram",
  "litre",
  "metre",
  "roll",
];
const emptyItem = {
  name: "",
  description: "",
  specification: "",
  brand: "",
  quantity: 1,
  unit: "piece",
  urgency: "NORMAL" as const,
  deadline: "",
};

export function RequestForm({ clients }: { clients: Option[] }) {
  const [open, setOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [requesters, setRequesters] = useState<Option[]>([]);
  const [images, setImages] = useState<Record<number, File[]>>({});
  const form = useForm<ItemRequestValues>({
    resolver: zodResolver(itemRequestSchema),
    defaultValues: {
      client: "",
      requester: "",
      received_via: "",
      received_via_custom: "",
      notes: "",
      items: [emptyItem],
    },
  });
  const items = useFieldArray({ control: form.control, name: "items" });
  const clientId = form.watch("client");
  const values = form.watch();
  const clientName = clients.find((client) => client.id === clientId)?.label;

  useEffect(() => {
    if (!clientId) {
      setRequesters([]);
      return;
    }
    void getRequesterOptions(clientId).then(setRequesters);
    form.setValue("requester", "");
  }, [clientId, form]);

  function submit() {
    startTransition(async () => {
      const result = await createItemRequest(form.getValues());
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      let imageFailures = 0;
      if (result.data) {
        for (const [index, files] of Object.entries(images)) {
          const item = result.data.items[Number(index)];
          if (!item) continue;
          for (const file of files) {
            const upload = new FormData();
            upload.set("item", item.id);
            upload.set("file", file);
            const uploaded = await uploadItemImage(upload);
            if (!uploaded.success) imageFailures += 1;
          }
        }
      }
      toast.success(
        imageFailures
          ? `${result.message} ${imageFailures} image(s) could not be uploaded.`
          : result.message,
      );
      form.reset({
        client: "",
        requester: "",
        received_via: "",
        received_via_custom: "",
        notes: "",
        items: [emptyItem],
      });
      setReviewing(false);
      setImages({});
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Register item request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        {reviewing ? (
          <>
            <DialogHeader>
              <DialogTitle>Review item request</DialogTitle>
              <DialogDescription>
                Confirm the client and every item before saving. Each item will
                receive its own tracker and unique code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requester</p>
                  <p className="font-medium">
                    {requesters.find((v) => v.id === values.requester)?.label ||
                      clientName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Received through
                  </p>
                  <p className="font-medium">
                    {values.received_via_custom ||
                      values.received_via ||
                      "Not recorded"}
                  </p>
                </div>
                {values.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p>{values.notes}</p>
                  </div>
                )}
              </div>
              {values.items.map((item, index) => (
                <article
                  key={index}
                  className="space-y-2 rounded-xl border p-4"
                >
                  <p className="text-sm font-semibold text-primary">
                    Item {index + 1}
                  </p>
                  <h3 className="font-heading text-lg font-semibold">
                    {item.name}
                  </h3>
                  <p>{item.description}</p>
                  <dl className="grid gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Quantity</dt>
                      <dd>
                        {item.quantity} {item.unit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Urgency</dt>
                      <dd>{item.urgency}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Deadline</dt>
                      <dd>{item.deadline || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Images</dt>
                      <dd>{images[index]?.length || 0}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewing(false)}>
                Edit request
              </Button>
              <Button disabled={pending} onClick={submit}>
                {pending ? "Saving…" : "Confirm and save"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={form.handleSubmit(() => setReviewing(true))}
            className="space-y-6"
          >
            <DialogHeader>
              <DialogTitle>Register item request</DialogTitle>
              <DialogDescription>
                One client request may contain several items. Each saved item
                starts an independent tracker.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Client"
                error={form.formState.errors.client?.message}
              >
                <Select
                  value={clientId}
                  onValueChange={(value) =>
                    form.setValue("client", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose CRM client" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Who made the request?">
                <Select
                  value={form.watch("requester") || "CLIENT"}
                  onValueChange={(value) =>
                    form.setValue("requester", value === "CLIENT" ? "" : value)
                  }
                  disabled={!clientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Client or contact" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md">
                    <SelectItem value="CLIENT">The client</SelectItem>
                    {requesters.map((requester) => (
                      <SelectItem key={requester.id} value={requester.id}>
                        {requester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="How was it received?">
                <Select
                  value={form.watch("received_via") || "NONE"}
                  onValueChange={(value) =>
                    form.setValue(
                      "received_via",
                      value === "NONE"
                        ? ""
                        : (value as ItemRequestValues["received_via"]),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md">
                    <SelectItem value="NONE">Not recorded</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="WALK_IN">Walk-in client</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {form.watch("received_via") === "CUSTOM" && (
                <Field
                  label="Custom channel"
                  error={form.formState.errors.received_via_custom?.message}
                >
                  <Input {...form.register("received_via_custom")} />
                </Field>
              )}
            </div>
            <Field label="Request notes">
              <Textarea {...form.register("notes")} />
            </Field>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold">
                    Requested items
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add every item included in this client request.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => items.append(emptyItem)}
                >
                  <Plus className="size-4" /> Add item
                </Button>
              </div>
              {items.fields.map((field, index) => (
                <article
                  key={field.id}
                  className="space-y-4 rounded-2xl border bg-card p-4 md:p-5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Item {index + 1}</h4>
                    {items.fields.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove item ${index + 1}`}
                        onClick={() => {
                          items.remove(index);
                          setImages({});
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Item name"
                      error={
                        form.formState.errors.items?.[index]?.name?.message
                      }
                    >
                      <Input {...form.register(`items.${index}.name`)} />
                    </Field>
                    <Field label="Brand (optional)">
                      <Input {...form.register(`items.${index}.brand`)} />
                    </Field>
                    <Field
                      label="Description"
                      error={
                        form.formState.errors.items?.[index]?.description
                          ?.message
                      }
                      className="sm:col-span-2"
                    >
                      <Textarea
                        {...form.register(`items.${index}.description`)}
                      />
                    </Field>
                    <Field
                      label="Specification (optional)"
                      className="sm:col-span-2"
                    >
                      <Textarea
                        {...form.register(`items.${index}.specification`)}
                      />
                    </Field>
                    <Field
                      label="Quantity"
                      error={
                        form.formState.errors.items?.[index]?.quantity?.message
                      }
                    >
                      <Input
                        type="number"
                        min="0.0001"
                        step="any"
                        {...form.register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                    <Field label="Unit">
                      <UnitControl
                        // React Hook Form watch is intentionally read during this dynamic field render.
                        // eslint-disable-next-line react-hooks/incompatible-library
                        value={form.watch(`items.${index}.unit`)}
                        onChange={(value) =>
                          form.setValue(`items.${index}.unit`, value, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </Field>
                    <Field label="Urgency">
                      <Select
                        value={form.watch(`items.${index}.urgency`)}
                        onValueChange={(value) =>
                          form.setValue(
                            `items.${index}.urgency`,
                            value as ItemRequestValues["items"][number]["urgency"],
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="backdrop-blur-md">
                          {["LOW", "NORMAL", "HIGH", "URGENT", "CRITICAL"].map(
                            (value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Deadline (optional)">
                      <Deadline
                        value={form.watch(`items.${index}.deadline`)}
                        onChange={(value) =>
                          form.setValue(`items.${index}.deadline`, value, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Sample images (optional)">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) =>
                        setImages((current) => ({
                          ...current,
                          [index]: Array.from(event.target.files || []).slice(
                            0,
                            10,
                          ),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG or WebP; up to 10 images and 10 MB each.
                    </p>
                  </Field>
                </article>
              ))}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Review request</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Deadline({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const date = value ? new Date(`${value}T12:00:00`) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, "PPP") : "Choose date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 backdrop-blur-md" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) =>
            onChange(selected ? format(selected, "yyyy-MM-dd") : "")
          }
        />
      </PopoverContent>
    </Popover>
  );
}

function UnitControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const custom = !units.includes(value);
  return (
    <div className="space-y-2">
      <Select
        value={custom ? "CUSTOM" : value}
        onValueChange={(next) => onChange(next === "CUSTOM" ? "" : next)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md">
          {units.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
          <SelectItem value="CUSTOM">Custom unit</SelectItem>
        </SelectContent>
      </Select>
      {custom && (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter custom unit"
        />
      )}
    </div>
  );
}
