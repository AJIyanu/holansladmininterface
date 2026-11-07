"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function optionsFrom(
  children: ReactNode,
): Array<{ value: string; label: ReactNode; disabled?: boolean }> {
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<{
        value?: string;
        children?: ReactNode;
        disabled?: boolean;
      }>(child)
    )
      return [];
    if (child.type === Fragment) return optionsFrom(child.props.children);
    return [
      {
        value: String(child.props.value ?? child.props.children),
        label: child.props.children,
        disabled: child.props.disabled,
      },
    ];
  });
}

/** Shadcn select shared by server-rendered filters and client ledger forms. */
export function LedgerSelect({
  children,
  value,
  defaultValue,
  onChange,
  className,
  name,
  required,
  disabled,
  ...props
}: {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (event: { target: { value: string } }) => void;
  className?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}) {
  const options = optionsFrom(children);
  const initial = defaultValue ?? options[0]?.value ?? "";
  const [draft, setDraft] = useState(initial);
  const submission = useRef<HTMLInputElement>(null);
  const selected = value ?? draft;
  const empty = "__ledger_empty__";
  const placeholder = options.find((option) => option.value === "")?.label;
  useEffect(() => {
    const form = submission.current?.form;
    const reset = () => setDraft(initial);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [initial]);
  return (
    <>
      <input
        ref={submission}
        type="hidden"
        name={name}
        value={selected}
        disabled={disabled}
      />
      <Select
        value={selected || (required ? "" : empty)}
        onValueChange={(next) => {
          const nextValue = next === empty ? "" : next;
          setDraft(nextValue);
          onChange?.({ target: { value: nextValue } });
        }}
        required={required}
        disabled={disabled}
      >
        <SelectTrigger {...props} className={cn("w-full min-w-0", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((option) => !required || option.value !== "")
            .map((option) => (
              <SelectItem
                key={option.value}
                value={option.value || empty}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </>
  );
}

/** ISO date values for FormData and React Hook Form, with a spacious calendar. */
export function LedgerDatePicker({
  value,
  defaultValue,
  onChange,
  onBlur,
  name,
  required,
  disabled,
  className,
  ref,
  ...props
}: Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onBlur"
> & {
  value?: string;
  defaultValue?: string;
  onBlur?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(defaultValue ?? "");
  const selected = value ?? draft;
  useEffect(() => {
    const form = input.current?.form;
    const reset = () => {
      setDraft(defaultValue ?? "");
      setOpen(false);
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue]);
  return (
    <span className="block min-w-0">
      <input
        {...props}
        ref={(node) => {
          input.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        name={name}
        value={selected}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={onChange ?? (() => {})}
        onBlur={onBlur}
        onFocus={() => trigger.current?.focus()}
        onInvalid={(event) => {
          event.preventDefault();
          trigger.current?.focus();
          setOpen(true);
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={trigger}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-required={required}
            aria-invalid={props["aria-invalid"]}
            onBlur={onBlur}
            className={cn(
              "w-full min-w-[min(100%,14rem)] justify-start text-left font-normal",
              className,
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {selected
              ? format(parseISO(selected), "dd MMM yyyy")
              : "Choose a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[22rem] max-w-[calc(100vw-2rem)] p-0"
        >
          <Calendar
            className="w-full [--cell-size:2.5rem]"
            mode="single"
            selected={selected ? parseISO(selected) : undefined}
            defaultMonth={selected ? parseISO(selected) : undefined}
            onSelect={(date) => {
              const next = date ? format(date, "yyyy-MM-dd") : "";
              setDraft(next);
              if (input.current) {
                input.current.value = next;
                onChange?.({
                  target: input.current,
                  currentTarget: input.current,
                } as React.ChangeEvent<HTMLInputElement>);
              }
              setOpen(false);
            }}
          />
          {!required && (
            <Button
              type="button"
              variant="ghost"
              className="m-2"
              onClick={() => {
                setDraft("");
                if (input.current) {
                  input.current.value = "";
                  onChange?.({
                    target: input.current,
                    currentTarget: input.current,
                  } as React.ChangeEvent<HTMLInputElement>);
                }
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </span>
  );
}
