export type TaskReminderPreset =
  | "IN_5_MINUTES"
  | "IN_10_MINUTES"
  | "IN_30_MINUTES"
  | "IN_1_HOUR"
  | "IN_5_HOURS"
  | "BEFORE_DUE_5_MINUTES"
  | "BEFORE_DUE_30_MINUTES"
  | "BEFORE_DUE_1_HOUR"
  | "BEFORE_DUE_5_HOURS"
  | "CUSTOM";

export interface TaskReminderPresetOption {
  value: TaskReminderPreset;
  label: string;
  requiresDueDate?: boolean;
}

export const TASK_REMINDER_PRESETS: TaskReminderPresetOption[] = [
  {
    value: "IN_5_MINUTES",
    label: "In 5 minutes",
  },
  {
    value: "IN_10_MINUTES",
    label: "In 10 minutes",
  },
  {
    value: "IN_30_MINUTES",
    label: "In 30 minutes",
  },
  {
    value: "IN_1_HOUR",
    label: "In 1 hour",
  },
  {
    value: "IN_5_HOURS",
    label: "In 5 hours",
  },
  {
    value: "BEFORE_DUE_5_MINUTES",
    label: "5 minutes before deadline",
    requiresDueDate: true,
  },
  {
    value: "BEFORE_DUE_30_MINUTES",
    label: "30 minutes before deadline",
    requiresDueDate: true,
  },
  {
    value: "BEFORE_DUE_1_HOUR",
    label: "1 hour before deadline",
    requiresDueDate: true,
  },
  {
    value: "BEFORE_DUE_5_HOURS",
    label: "5 hours before deadline",
    requiresDueDate: true,
  },
  {
    value: "CUSTOM",
    label: "Custom date and time",
  },
];

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60_000);
}

export function resolveReminderPreset(
  preset: TaskReminderPreset,
  dueAt: string | null,
): Date | null {
  const now = new Date();

  switch (preset) {
    case "IN_5_MINUTES":
      return addMinutes(now, 5);

    case "IN_10_MINUTES":
      return addMinutes(now, 10);

    case "IN_30_MINUTES":
      return addMinutes(now, 30);

    case "IN_1_HOUR":
      return addMinutes(now, 60);

    case "IN_5_HOURS":
      return addMinutes(now, 300);

    case "BEFORE_DUE_5_MINUTES":
    case "BEFORE_DUE_30_MINUTES":
    case "BEFORE_DUE_1_HOUR":
    case "BEFORE_DUE_5_HOURS": {
      if (!dueAt) {
        return null;
      }

      const dueDate = new Date(dueAt);

      if (Number.isNaN(dueDate.getTime())) {
        return null;
      }

      const minutesBeforeDue = {
        BEFORE_DUE_5_MINUTES: 5,
        BEFORE_DUE_30_MINUTES: 30,
        BEFORE_DUE_1_HOUR: 60,
        BEFORE_DUE_5_HOURS: 300,
      }[preset];

      return subtractMinutes(dueDate, minutesBeforeDue);
    }

    case "CUSTOM":
      return null;
  }
}

export function validateReminderDate(
  remindAt: Date,
  dueAt: string | null,
): string | null {
  if (Number.isNaN(remindAt.getTime())) {
    return "Enter a valid reminder date and time.";
  }

  if (remindAt.getTime() <= Date.now()) {
    return "The reminder must be scheduled in the future.";
  }

  if (dueAt) {
    const dueDate = new Date(dueAt);

    if (
      !Number.isNaN(dueDate.getTime()) &&
      remindAt.getTime() > dueDate.getTime()
    ) {
      return "The reminder cannot be scheduled after the task deadline.";
    }
  }

  return null;
}
