"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CalendarIcon,
  Download,
  Images,
  Pencil,
  Plus,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  addTrackerActivity,
  changeTrackerStatus,
  editRequestedItem,
  removeItemImages,
  uploadItemImages,
} from "./actions";
import { formatDate, formatQuantity, titleCase } from "./format";
import { itemEditSchema, type ItemEditValues } from "./schema";
import type { TrackerDetail as Detail } from "./types";

export function TrackerDetail({
  item,
  canAdd,
  canChangeStatus,
  canEdit,
  canAddPictures,
  canDeletePictures,
}: {
  item: Detail;
  canAdd: boolean;
  canChangeStatus: boolean;
  canEdit: boolean;
  canAddPictures: boolean;
  canDeletePictures: boolean;
}) {
  const complete = item.status === "DELIVERED" || item.status === "CLOSED";
  return (
    <main className="space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {item.client_name} · {item.code}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold">{item.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Registered by {item.created_by_name} on{" "}
            {formatDate(item.received_at, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(canAddPictures || canDeletePictures) && !complete && (
            <PictureManager
              item={item}
              canAdd={canAddPictures}
              canDelete={canDeletePictures}
            />
          )}
          {canEdit && !complete && <EditItemDialog item={item} />}
          {canAdd && !complete && <ActivityDialog item={item} />}
          {canChangeStatus && !complete && <StatusDialog item={item} />}
        </div>
      </header>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold">Item journey</h2>
          <div className="relative space-y-4 before:absolute before:bottom-6 before:left-[1.15rem] before:top-6 before:w-px before:bg-border">
            {item.activities.map((activity) => (
              <article key={activity.id} className="relative flex gap-4">
                <span
                  className={`z-10 mt-4 size-9 shrink-0 rounded-full border-4 border-background ${activity.category === "COMMENT" ? "bg-info" : activity.status_result ? "bg-success" : "bg-primary"}`}
                />
                <div className="min-w-0 flex-1 rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {activity.category === "COMMENT"
                          ? "Comment"
                          : "Activity"}
                      </p>
                      <h3 className="font-heading text-lg font-semibold">
                        {activity.title}
                      </h3>
                    </div>
                    <time className="text-sm text-muted-foreground">
                      {formatDate(activity.occurred_at, true)}
                    </time>
                  </div>
                  {activity.description && (
                    <p className="mt-2 whitespace-pre-wrap">
                      {activity.description}
                    </p>
                  )}
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <UserRound className="size-4" /> Worked on by{" "}
                    {activity.created_by_name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-heading text-xl font-semibold">Item summary</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Status" value={titleCase(item.status)} />
            <Row
              label="Quantity"
              value={formatQuantity(item.quantity, item.unit)}
            />
            <Row label="Urgency" value={titleCase(item.urgency)} />
            <Row label="Deadline" value={formatDate(item.deadline)} />
            <Row label="Brand" value={item.brand || "Not specified"} />
            <Row
              label="Received through"
              value={titleCase(
                item.received_via_custom || item.received_via || "Not recorded",
              )}
            />
          </dl>
          <div className="border-t pt-4">
            <p className="text-sm font-medium">Description</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
          {item.specification && (
            <div>
              <p className="text-sm font-medium">Specification</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.specification}
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function PictureManager({
  item,
  canAdd,
  canDelete,
}: {
  item: Detail;
  canAdd: boolean;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const remaining = 5 - item.images.length;

  function chooseFiles(list: FileList | null) {
    const next = Array.from(list || []);
    if (next.length > remaining) {
      toast.error(
        `You can add only ${remaining} more picture${remaining === 1 ? "" : "s"}.`,
      );
      return;
    }
    if (next.some((file) => file.size > 5 * 1024 * 1024)) {
      toast.error("Each picture must be 5 MB or smaller.");
      return;
    }
    setFiles(next);
  }

  function upload() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("item", item.id);
      for (const file of files) formData.append("files", file);
      const result = await uploadItemImages(formData);
      if (result.success) {
        toast.success(result.message);
        setFiles([]);
        setOpen(false);
      } else toast.error(result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeItemImages({
        item: item.id,
        images: selected,
      });
      if (result.success) {
        toast.success(result.message);
        setSelected([]);
        setConfirmingDelete(false);
        setOpen(false);
      } else toast.error(result.message);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Images className="size-4" /> Manage pictures
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage picture samples</DialogTitle>
          <DialogDescription>
            Up to five JPEG, PNG or WebP pictures, with a maximum of 5 MB each.
            Additions and removals become attributed tracker activities.
          </DialogDescription>
        </DialogHeader>
        {item.images.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {item.images.map((picture) => {
              const checked = selected.includes(picture.id);
              return (
                <article
                  key={picture.id}
                  className="overflow-hidden rounded-xl border"
                >
                  <a
                    href={`/api/procurement/item-images/${picture.id}/download`}
                    target="_blank"
                    className="relative block h-40 bg-muted"
                  >
                    <Image
                      src={`/api/procurement/item-images/${picture.id}/download`}
                      alt={picture.caption || picture.filename}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </a>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium">
                      {picture.filename}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <a
                          href={`/api/procurement/item-images/${picture.id}/download`}
                          target="_blank"
                        >
                          <Download className="size-4" /> Download
                        </a>
                      </Button>
                      {canDelete && (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              setSelected((current) =>
                                value
                                  ? [...current, picture.id]
                                  : current.filter((id) => id !== picture.id),
                              )
                            }
                          />
                          Remove
                        </label>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            No picture samples have been added.
          </p>
        )}
        {canAdd && remaining > 0 && (
          <div className="space-y-2 rounded-xl border p-4">
            <Label>Add pictures · {remaining} remaining</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => chooseFiles(event.target.files)}
            />
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {files.length} picture{files.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>
        )}
        {confirmingDelete ? (
          <div className="rounded-xl border border-destructive-border bg-destructive-subtle p-4 text-destructive-content">
            <p className="font-medium">
              Remove {selected.length} picture sample
              {selected.length === 1 ? "" : "s"}?
            </p>
            <p className="mt-1 text-sm">
              The stored files will be deleted and the action recorded in the
              journey.
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {canDelete &&
            selected.length > 0 &&
            (confirmingDelete ? (
              <Button variant="destructive" disabled={pending} onClick={remove}>
                {pending ? "Removing…" : "Confirm removal"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setConfirmingDelete(true)}
              >
                Review removal
              </Button>
            ))}
          {canAdd && files.length > 0 && !confirmingDelete && (
            <Button disabled={pending} onClick={upload}>
              {pending ? "Uploading…" : "Add pictures"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const editUnits = [
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

function EditItemDialog({ item }: { item: Detail }) {
  const [open, setOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<ItemEditValues>({
    resolver: zodResolver(itemEditSchema),
    defaultValues: {
      name: item.name,
      description: item.description,
      specification: item.specification,
      brand: item.brand,
      quantity: Number(item.quantity),
      unit: item.unit,
      urgency: item.urgency,
      deadline: item.deadline || "",
    },
  });
  // React Hook Form watch drives the live edit-review comparison.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();
  const changes = itemChanges(item, values);

  function save() {
    startTransition(async () => {
      const result = await editRequestedItem({ item: item.id, values });
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setReviewing(false);
      } else toast.error(result.message);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setReviewing(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" /> Edit item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {reviewing ? (
          <>
            <DialogHeader>
              <DialogTitle>Review item changes</DialogTitle>
              <DialogDescription>
                These changes will be saved as a new attributed activity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {changes.map((change) => (
                <div key={change.label} className="rounded-xl border p-4">
                  <p className="font-medium">{change.label}</p>
                  <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Previous</p>
                      <p className="break-words">{change.from || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">New</p>
                      <p className="break-words">{change.to || "Not set"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewing(false)}>
                Edit
              </Button>
              <Button disabled={pending || changes.length === 0} onClick={save}>
                {pending ? "Saving…" : "Confirm changes"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(() => setReviewing(true))}
          >
            <DialogHeader>
              <DialogTitle>Edit requested item</DialogTitle>
              <DialogDescription>
                Only changed properties will appear in the new tracker activity.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField
                label="Item name"
                error={form.formState.errors.name?.message}
              >
                <Input {...form.register("name")} />
              </EditField>
              <EditField label="Brand">
                <Input {...form.register("brand")} />
              </EditField>
              <EditField
                label="Description"
                className="sm:col-span-2"
                error={form.formState.errors.description?.message}
              >
                <Textarea {...form.register("description")} />
              </EditField>
              <EditField label="Specification" className="sm:col-span-2">
                <Textarea {...form.register("specification")} />
              </EditField>
              <EditField
                label="Quantity"
                error={form.formState.errors.quantity?.message}
              >
                <Input
                  type="number"
                  min="0.0001"
                  step="any"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
              </EditField>
              <EditField label="Unit">
                <EditUnit
                  value={values.unit}
                  onChange={(unit) =>
                    form.setValue("unit", unit, { shouldValidate: true })
                  }
                />
              </EditField>
              <EditField label="Urgency">
                <Select
                  value={values.urgency}
                  onValueChange={(urgency) =>
                    form.setValue(
                      "urgency",
                      urgency as ItemEditValues["urgency"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md">
                    {["LOW", "NORMAL", "HIGH", "URGENT", "CRITICAL"].map(
                      (urgency) => (
                        <SelectItem key={urgency} value={urgency}>
                          {titleCase(urgency)}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </EditField>
              <EditField label="Deadline">
                <EditDeadline
                  value={values.deadline}
                  onChange={(deadline) => form.setValue("deadline", deadline)}
                />
              </EditField>
            </div>
            {changes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Change at least one item property to continue.
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changes.length === 0}>
                Review changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function itemChanges(item: Detail, values: ItemEditValues) {
  const rows = [
    ["Item name", item.name, values.name],
    ["Description", item.description, values.description],
    ["Specification", item.specification, values.specification],
    ["Brand", item.brand, values.brand],
    ["Quantity", Number(item.quantity), values.quantity],
    ["Unit", item.unit, values.unit],
    ["Urgency", item.urgency, values.urgency],
    ["Deadline", item.deadline || "", values.deadline],
  ] as const;
  return rows
    .filter(([, from, to]) => from !== to)
    .map(([label, from, to]) => ({
      label,
      from: String(from),
      to: String(to),
    }));
}

function EditField({
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

function EditUnit({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const custom = !editUnits.includes(value);
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
          {editUnits.map((unit) => (
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

function EditDeadline({
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
      <PopoverContent className="w-auto p-0 backdrop-blur-md">
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

function ActivityDialog({ item }: { item: Detail }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState<"ACTIVITY" | "COMMENT">("ACTIVITY");
  const [title, setTitle] = useState(
    item.suggested_titles[0]?.value || "GENERAL_UPDATE",
  );
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  function save() {
    startTransition(async () => {
      const result = await addTrackerActivity({
        item: item.id,
        category,
        title_code: category === "COMMENT" ? "COMMENT" : title,
        custom_title: customTitle,
        description,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) setOpen(false);
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Add activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add tracker activity</DialogTitle>
          <DialogDescription>
            Record what happened, when it happened, and who performed the work.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Entry type</Label>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as "ACTIVITY" | "COMMENT")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md">
                <SelectItem value="ACTIVITY">Activity</SelectItem>
                <SelectItem value="COMMENT">Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {category === "ACTIVITY" && (
            <>
              <div className="space-y-2">
                <Label>Activity title</Label>
                <Select value={title} onValueChange={setTitle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md">
                    {item.suggested_titles.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {title === "CUSTOM" && (
                <div className="space-y-2">
                  <Label>Custom title</Label>
                  <Textarea
                    value={customTitle}
                    onChange={(event) => setCustomTitle(event.target.value)}
                  />
                </div>
              )}
            </>
          )}
          <div className="space-y-2">
            <Label>{category === "COMMENT" ? "Comment" : "Description"}</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              pending || (!description.trim() && category === "COMMENT")
            }
            onClick={save}
          >
            {pending ? "Saving…" : "Save activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({ item }: { item: Detail }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    "OPEN" | "SUSPENDED" | "DELIVERED" | "CLOSED"
  >(item.status === "SUSPENDED" ? "OPEN" : "SUSPENDED");
  const [reason, setReason] = useState("");
  const choices =
    item.status === "SUSPENDED"
      ? ["OPEN", "CLOSED"]
      : ["SUSPENDED", "DELIVERED", "CLOSED"];
  function save() {
    startTransition(async () => {
      const result = await changeTrackerStatus({
        item: item.id,
        status,
        reason,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) setOpen(false);
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Change status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change item status</DialogTitle>
          <DialogDescription>
            The reason becomes a permanent system activity in the item journey.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as typeof status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md">
                {choices.map((choice) => (
                  <SelectItem key={choice} value={choice}>
                    {titleCase(choice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={pending || reason.trim().length < 2} onClick={save}>
            {pending ? "Saving…" : "Confirm status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
