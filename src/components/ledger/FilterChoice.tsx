"use client";
import { useState } from "react";
import { Lookup } from "./Lookup";
export function FilterChoice({
  name,
  label,
  resource,
  initial,
}: {
  name: string;
  label: string;
  resource: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="min-w-48 space-y-1 text-sm">
      <label htmlFor={`filter-${name}`}>{label}</label>
      <input type="hidden" name={name} value={value} />
      <Lookup
        resource={resource}
        value={value}
        onChange={setValue}
        triggerId={`filter-${name}`}
      />
    </div>
  );
}
