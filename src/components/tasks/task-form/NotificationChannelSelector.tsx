"use client";

import { Bell, Mail, MessageCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { TaskNotificationChannel } from "@/types/tasks";

interface NotificationChannelSelectorProps {
  value: TaskNotificationChannel[];
  onChange: (channels: TaskNotificationChannel[]) => void;
  error?: string;
}

const channels = [
  {
    value: "DASHBOARD" as const,
    label: "Dashboard",
    description: "Show the assignment in the staff dashboard.",
    icon: Bell,
  },
  {
    value: "EMAIL" as const,
    label: "Email",
    description: "Send an assignment email where available.",
    icon: Mail,
  },
  {
    value: "WHATSAPP" as const,
    label: "WhatsApp",
    description: "Send through the configured WhatsApp provider.",
    icon: MessageCircle,
  },
];

export function NotificationChannelSelector({
  value,
  onChange,
  error,
}: NotificationChannelSelectorProps) {
  function toggleChannel(channel: TaskNotificationChannel, checked: boolean) {
    if (checked) {
      onChange(Array.from(new Set([...value, channel])));
      return;
    }

    onChange(value.filter((item) => item !== channel));
  }

  return (
    <div className="space-y-3">
      <Label>Assignment notifications</Label>

      <div className="grid gap-3 md:grid-cols-3">
        {channels.map((channel) => {
          const Icon = channel.icon;

          return (
            <Label
              key={channel.value}
              htmlFor={`channel-${channel.value}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-muted/40"
            >
              <Checkbox
                id={`channel-${channel.value}`}
                checked={value.includes(channel.value)}
                onCheckedChange={(state) =>
                  toggleChannel(channel.value, state === true)
                }
                className="mt-1"
              />

              <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

              <span>
                <span className="block font-medium">{channel.label}</span>

                <span className="block text-sm font-normal text-muted-foreground">
                  {channel.description}
                </span>
              </span>
            </Label>
          );
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
