"use client";

import { AlertTriangle, Construction } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { StaffAction, StaffProfile } from "./staff-list-types";

interface StaffActionDialogProps {
  action: StaffAction | null;
  profile: StaffProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const titles: Record<StaffAction, string> = {
  view: "View staff profile",
  edit: "Edit staff",
  roles: "Manage roles",
  department: "Change department",
  activity: "Login activity",
  audit: "Audit history",
  activate: "Activate account",
  deactivate: "Deactivate account",
  delete: "Delete staff permanently",
};

export default function StaffActionDialog({
  action,
  profile,
  open,
  onOpenChange,
}: StaffActionDialogProps) {
  if (!action) {
    return null;
  }

  const fullName =
    `${profile.user.first_name} ${profile.user.last_name}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-blue-200">
        <DialogHeader>
          <DialogTitle>{titles[action]}</DialogTitle>

          <DialogDescription>
            {fullName} · {profile.employee_id}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-dashed p-8 text-center">
          {action === "delete" || action === "deactivate" ? (
            <AlertTriangle className="mx-auto mb-3 size-8 text-[#F46C0B]" />
          ) : (
            <Construction className="mx-auto mb-3 size-8 text-muted-foreground" />
          )}

          <p className="font-medium">
            Action component ready for implementation
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            The dialog host is ready. The form or confirmation logic for this
            action will be implemented separately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
