"use client";

import { useRouter } from "next/navigation";

import ResponsiveActionGuard from "@/components/shared/responsive-action-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CurrentUser } from "@/types/auth";

import ChangeStaffDepartmentAction from "./actions/change-staff-department-action";
import DeleteStaffAction from "./actions/delete-staff-action";
import EditStaffAction from "./actions/edit-staff-action";
import ManageStaffRolesAction from "./actions/manage-staff-roles-action";
import StaffAccountStatusAction from "./actions/staff-account-status-action";
import StaffPasswordResetAction from "./actions/staff-password-reset-action";
import StaffRecentActivityAction from "./actions/staff-recent-activity-action";
import type { StaffAction, StaffProfile } from "./staff-list-types";

interface StaffActionDialogProps {
  action: StaffAction | null;
  profile: StaffProfile;
  currentUser: CurrentUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const titles: Record<StaffAction, string> = {
  edit: "Edit staff",
  roles: "Manage staff roles",
  department: "Change department",
  activity: "Recent login activity",
  audit: "Recent audit history",
  activate: "Activate account",
  deactivate: "Deactivate account",
  "reset-password": "Send password-reset link",
  delete: "Delete staff permanently",
};

function isReadOnlyAction(action: StaffAction) {
  return action === "activity" || action === "audit";
}

export default function StaffActionDialog({
  action,
  profile,
  currentUser,
  open,
  onOpenChange,
}: StaffActionDialogProps) {
  const router = useRouter();

  if (!action) {
    return null;
  }

  if (action === "delete" && !currentUser.is_superuser) {
    return null;
  }

  const fullName =
    `${profile.user.first_name} ${profile.user.last_name}`.trim();

  function closeDialog() {
    onOpenChange(false);
  }

  function completeAction() {
    onOpenChange(false);
    router.refresh();
  }

  const sharedProps = {
    profile,
    currentUser,
    onClose: closeDialog,
    onCompleted: completeAction,
  };

  let content: React.ReactNode;

  switch (action) {
    case "edit":
      content = <EditStaffAction {...sharedProps} />;
      break;

    case "roles":
      content = <ManageStaffRolesAction {...sharedProps} />;
      break;

    case "department":
      content = <ChangeStaffDepartmentAction {...sharedProps} />;
      break;

    case "activity":
      content = <StaffRecentActivityAction {...sharedProps} kind="login" />;
      break;

    case "audit":
      content = <StaffRecentActivityAction {...sharedProps} kind="audit" />;
      break;

    case "activate":
      content = <StaffAccountStatusAction {...sharedProps} activate />;
      break;

    case "deactivate":
      content = <StaffAccountStatusAction {...sharedProps} activate={false} />;
      break;

    case "reset-password":
      content = <StaffPasswordResetAction {...sharedProps} />;
      break;

    case "delete":
      content = <DeleteStaffAction {...sharedProps} />;
      break;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="min-w-0">
          <DialogTitle className="break-words">{titles[action]}</DialogTitle>

          <DialogDescription className="break-words">
            {fullName} · {profile.employee_id}
          </DialogDescription>
        </DialogHeader>

        {isReadOnlyAction(action) ? (
          content
        ) : (
          <ResponsiveActionGuard actionName={titles[action].toLowerCase()}>
            {content}
          </ResponsiveActionGuard>
        )}
      </DialogContent>
    </Dialog>
  );
}
