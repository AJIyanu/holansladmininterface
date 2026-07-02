"use client";

import { Building2, UserRound, UsersRound } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import type { TaskAssignmentType, TaskCreateCapabilities } from "@/types/tasks";

interface AssignmentTypeSelectorProps {
  value: TaskAssignmentType;
  onChange: (value: TaskAssignmentType) => void;
  capabilities: TaskCreateCapabilities;
}

const options = [
  {
    value: "PERSONAL" as const,
    label: "Personal task",
    description: "Create a private task for yourself.",
    icon: UserRound,
  },
  {
    value: "USERS" as const,
    label: "Selected staff",
    description: "Assign separate task copies to selected staff.",
    icon: UsersRound,
  },
  {
    value: "DEPARTMENT" as const,
    label: "Department",
    description: "Assign the task to active staff in a department.",
    icon: Building2,
  },
];

export function AssignmentTypeSelector({
  value,
  onChange,
  capabilities,
}: AssignmentTypeSelectorProps) {
  function isAvailable(type: TaskAssignmentType) {
    if (type === "PERSONAL") {
      return capabilities.canCreatePersonal;
    }

    if (type === "USERS") {
      return capabilities.canAssignUsers;
    }

    return capabilities.canAssignDepartment;
  }

  return (
    <RadioGroup
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as TaskAssignmentType)}
      className="grid gap-3 lg:grid-cols-3"
    >
      {options.map((option) => {
        const available = isAvailable(option.value);

        const Icon = option.icon;

        return (
          <Label
            key={option.value}
            htmlFor={`assignment-${option.value}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
              value === option.value &&
                available &&
                "border-primary bg-primary/5",
              available ? "hover:bg-muted/50" : "cursor-not-allowed opacity-50",
            )}
          >
            <RadioGroupItem
              id={`assignment-${option.value}`}
              value={option.value}
              disabled={!available}
              className="mt-1"
            />

            <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

            <span className="space-y-1">
              <span className="block font-medium">{option.label}</span>

              <span className="block text-sm font-normal text-muted-foreground">
                {option.description}
              </span>

              {!available ? (
                <span className="block text-xs font-normal text-amber-700">
                  You do not have permission for this assignment type.
                </span>
              ) : null}
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
