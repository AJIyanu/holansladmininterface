"use client";

import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { AuditLogEntry } from "./types";
import { displayUser, formatEventLabel, formatSecurityDate } from "./utils";

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 min-w-0 text-sm font-medium [overflow-wrap:anywhere]">
        {value || "Not available"}
      </dd>
    </div>
  );
}

export default function ActivityDetailDialog({
  entry,
}: {
  entry: AuditLogEntry;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="View activity details"
          className="shrink-0"
        >
          <Eye className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="min-w-0">
          <DialogTitle className="[overflow-wrap:anywhere]">
            {formatEventLabel(entry.event_type)}
          </DialogTitle>

          <DialogDescription>
            {formatSecurityDate(entry.created_at)}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailField label="Actor" value={displayUser(entry.user)} />

          <DetailField
            label="Target user"
            value={displayUser(entry.target_user, "None")}
          />

          <DetailField
            label="Status"
            value={
              <Badge
                variant={entry.status === "SUCCESS" ? "default" : "destructive"}
              >
                {entry.status}
              </Badge>
            }
          />

          <DetailField label="Category" value={entry.event_category} />

          <DetailField
            label="Attempted username"
            value={entry.username_attempted}
          />

          <DetailField label="IP address" value={entry.ip_address} />

          <DetailField label="Application" value={entry.app_label} />

          <DetailField label="Resource" value={entry.resource} />

          <DetailField label="Action" value={entry.action} />

          <DetailField label="Object ID" value={entry.object_id} />

          <div className="min-w-0 sm:col-span-2">
            <DetailField label="User agent" value={entry.user_agent} />
          </div>
        </dl>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Metadata
          </p>

          <pre className="max-h-72 min-w-0 whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-xs leading-5 [overflow-wrap:anywhere]">
            {JSON.stringify(entry.metadata ?? {}, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
