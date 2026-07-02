"use client";

import { Bell, Mail, MessageCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type {
  TaskNotificationChannel,
  TaskReminderCapabilities,
} from "@/types/tasks";

interface ReminderChannelSelectorProps {
  capabilities: TaskReminderCapabilities;
  value: TaskNotificationChannel[];
  onChange: (channels: TaskNotificationChannel[]) => void;
}

const channelOptions = [
  {
    value: "DASHBOARD" as const,
    label: "Dashboard",
    icon: Bell,
  },
  {
    value: "EMAIL" as const,
    label: "Email",
    icon: Mail,
  },
  {
    value: "WHATSAPP" as const,
    label: "WhatsApp",
    icon: MessageCircle,
  },
];

export function ReminderChannelSelector({
  capabilities,
  value,
  onChange,
}: ReminderChannelSelectorProps) {
  function toggleChannel(channel: TaskNotificationChannel, checked: boolean) {
    if (checked) {
      onChange(Array.from(new Set([...value, channel])));
      return;
    }

    onChange(value.filter((item) => item !== channel));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {channelOptions.map((option) => {
        const channelCapability = capabilities.channels[option.value];

        const available = channelCapability?.available ?? false;

        const Icon = option.icon;

        return (
          <Label
            key={option.value}
            htmlFor={`reminder-channel-${option.value}`}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4",
              available
                ? "cursor-pointer hover:bg-muted/40"
                : "cursor-not-allowed opacity-60",
            )}
          >
            <Checkbox
              id={`reminder-channel-${option.value}`}
              checked={value.includes(option.value)}
              disabled={!available}
              onCheckedChange={(checked) =>
                toggleChannel(option.value, checked === true)
              }
              className="mt-1"
            />

            <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

            <span className="min-w-0">
              <span className="block font-medium">{option.label}</span>

              {!available && channelCapability?.reason ? (
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {channelCapability.reason}
                </span>
              ) : null}
            </span>
          </Label>
        );
      })}
    </div>
  );
}
