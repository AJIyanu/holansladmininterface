"use client";

import {
  CalendarClock,
  ChevronRight,
  Download,
  Package,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatDate, formatQuantity, titleCase } from "./format";
import type { ItemRequest, RequestedItem } from "./types";

export function RequestCards({ requests }: { requests: ItemRequest[] }) {
  const [selected, setSelected] = useState<RequestedItem | null>(null);
  if (!requests.length) return <Empty />;
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {requests.map((request) => (
          <article
            key={request.id}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Registered {formatDate(request.received_at, true)}
                </p>
                <h2 className="mt-1 font-heading text-xl font-semibold">
                  {request.client_name}
                </h2>
                <p className="mt-1 text-sm">
                  Registered by {request.created_by_name}
                </p>
              </div>
              <Badge variant="secondary">
                {request.items.length} item
                {request.items.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              {request.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Package className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.code} · {formatQuantity(item.quantity, item.unit)} ·{" "}
                      {titleCase(item.urgency)}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <ItemDialog
        item={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}

function ItemDialog({
  item,
  onOpenChange,
}: {
  item: RequestedItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>{item.code}</DialogDescription>
            </DialogHeader>
            {item.images.length > 0 && (
              <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                <div className="flex gap-3 pb-3">
                  {item.images.map((image) => (
                    <a
                      key={image.id}
                      href={`/api/procurement/item-images/${image.id}/download`}
                      target="_blank"
                      className="group relative inline-block h-56 w-80 shrink-0 overflow-hidden rounded-xl border bg-muted"
                    >
                      <Image
                        src={`/api/procurement/item-images/${image.id}/download`}
                        alt={image.caption || image.filename}
                        fill
                        unoptimized
                        className="size-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-background/90 p-2 text-sm opacity-0 transition group-hover:opacity-100">
                        <Download className="size-4" /> Download{" "}
                        {image.filename}
                      </span>
                    </a>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail
                label="Client"
                value={item.client_name}
                icon={<UserRound />}
              />
              <Detail
                label="Registered"
                value={formatDate(item.received_at, true)}
                icon={<CalendarClock />}
              />
              <Detail
                label="Received by"
                value={item.created_by_name}
                icon={<UserRound />}
              />
            </div>
            <section className="space-y-3 rounded-xl border p-4">
              <h3 className="font-heading font-semibold">Item details</h3>
              <p>{item.description}</p>
              {item.specification && (
                <p>
                  <span className="font-medium">Specification:</span>{" "}
                  {item.specification}
                </p>
              )}
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Brand</dt>
                  <dd>{item.brand || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd>{formatQuantity(item.quantity, item.unit)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Urgency</dt>
                  <dd>{titleCase(item.urgency)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Deadline</dt>
                  <dd>{formatDate(item.deadline)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{titleCase(item.status)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Activities</dt>
                  <dd>{item.activity_count}</dd>
                </div>
              </dl>
            </section>
            <Button asChild>
              <a href={`/dashboard/procurement/requesttracks/items/${item.id}`}>
                Open item tracker
              </a>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactElement;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-muted/40 p-3">
      <span className="mt-0.5 text-primary [&>svg]:size-4">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
function Empty() {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <Package className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-heading text-xl font-semibold">
        No item requests found
      </h2>
      <p className="mt-2 text-muted-foreground">
        Adjust the filters or register the first client request.
      </p>
    </div>
  );
}
