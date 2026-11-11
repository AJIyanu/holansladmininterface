"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addTrackerActivity, changeTrackerStatus } from "./actions";
import { formatDate, formatQuantity, titleCase } from "./format";
import type { TrackerDetail as Detail } from "./types";

export function TrackerDetail({
  item,
  canAdd,
  canChangeStatus,
}: {
  item: Detail;
  canAdd: boolean;
  canChangeStatus: boolean;
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
            Requested by {item.requester_name} · Registered by{" "}
            {item.created_by_name} on {formatDate(item.received_at, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
