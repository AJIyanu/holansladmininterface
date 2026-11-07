"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { invoiceUnits, shortUnit } from "@/features/sales-invoice/units";

export function UnitSelect({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const [custom, setCustom] = useState(
    !invoiceUnits.some(([unit]) => unit === shortUnit(value)),
  );
  return (
    <div className="space-y-2">
      <select
        aria-label="Unit of measurement"
        className="block w-full rounded border bg-background p-2"
        value={custom ? "custom" : shortUnit(value)}
        onBlur={onBlur}
        onChange={(event) => {
          const next = event.target.value;
          setCustom(next === "custom");
          onChange(next === "custom" ? "" : next);
        }}
      >
        {invoiceUnits.map(([unit, label]) => (
          <option key={unit} value={unit}>
            {label} ({unit})
          </option>
        ))}
        <option value="custom">Custom unit…</option>
      </select>
      {custom && (
        <Input
          aria-label="Custom unit short form"
          placeholder="Short form, e.g. tray"
          maxLength={40}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}
