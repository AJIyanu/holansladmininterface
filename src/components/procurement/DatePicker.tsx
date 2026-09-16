"use client";

import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function ProcurementDatePicker({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  disablePast,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  invalid?: boolean;
  disablePast?: boolean;
}) {
  const selected = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className="min-w-0 flex-1 justify-start font-normal"
          >
            <CalendarIcon className="size-4" />
            {selected ? (
              format(selected, "d MMMM yyyy")
            ) : (
              <span className="text-muted-foreground">Choose a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto bg-white/30 p-0 backdrop-blur-md"
        >
          <Calendar
            mode="single"
            selected={selected}
            disabled={disablePast ? { before: today } : undefined}
            onSelect={(date) => {
              if (date) onChange(isoDate(date));
              onBlur();
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label="Clear date"
          onClick={() => onChange("")}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
