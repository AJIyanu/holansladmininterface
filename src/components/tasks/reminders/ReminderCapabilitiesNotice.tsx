import { Bell, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { TaskReminderCapabilities } from "@/types/tasks";

interface ReminderCapabilitiesNoticeProps {
  capabilities: TaskReminderCapabilities;
}

export function ReminderCapabilitiesNotice({
  capabilities,
}: ReminderCapabilitiesNoticeProps) {
  if (!capabilities.enabled) {
    return (
      <Alert variant="destructive">
        <Bell className="size-4" />

        <AlertTitle>Reminders unavailable</AlertTitle>

        <AlertDescription>
          Task reminders are currently disabled.
        </AlertDescription>
      </Alert>
    );
  }

  if (!capabilities.message) {
    return null;
  }

  return (
    <Alert>
      <Info className="size-4" />

      <AlertTitle>Reminder delivery</AlertTitle>

      <AlertDescription>{capabilities.message}</AlertDescription>
    </Alert>
  );
}
