export type Entity = { id: string; [key: string]: unknown };
export type Page<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
export type Access = { is_superuser: boolean; permissions: string[] };
export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "decimal"
    | "date"
    | "datetime"
    | "boolean"
    | "file"
    | "select"
    | "lookup";
  required?: boolean;
  options?: string[];
  resource?: string;
  flatten?: string;
  help?: string;
  defaultValue?: string | boolean;
  disablePast?: boolean;
  max?: number;
};
export type FormDefinition = {
  title: string;
  fields: Field[];
  lines?: { name: string; label: string; fields: Field[] };
  permission: string;
  endpoint: string;
  destination: string;
  notice?: string;
};
export type Resource = {
  title: string;
  model: string;
  columns: string[];
  form?: FormDefinition;
  filters?: Record<string, string>;
};
export type Tracker = {
  item: string;
  requested_quantity: string;
  ordered_quantity: string;
  accepted_quantity: string;
  closed_rejected_quantity: string;
  remaining_quantity: string;
  milestones: {
    code: string;
    label: string;
    state: string;
    event_count: number;
    latest_event: Entity | null;
  }[];
  attempts: {
    id: string;
    po_line: string;
    replaces: string | null;
    strategy: string;
    status: string;
    quantities: Record<string, string>;
  }[];
  events: Entity[];
  event_count: number;
  previous_item: string | null;
  reorders: string[];
  finance: { available: boolean; reason: string };
};
export function text(value: unknown): string {
  return value === null || value === undefined
    ? "—"
    : typeof value === "object"
      ? ""
      : String(value);
}
export function entities(value: unknown): Entity[] {
  return Array.isArray(value) ? (value as Entity[]) : [];
}
export function label(row: Entity): string {
  return text(
    row.display_label ||
      row.label ||
      row.description ||
      row.number ||
      row.reference ||
      row.client_name ||
      row.supplier_name ||
      row.receiver_name ||
      row.filename ||
      row.reason ||
      `#${row.id.replaceAll("-", "").slice(0, 6).toUpperCase()}`,
  );
}
export function can(user: Access, permission: string): boolean {
  return user.is_superuser || user.permissions.includes(permission);
}
export function canWrite(user: Access, permission: string): boolean {
  return (
    can(user, "procurement.procurementrequest.view") &&
    can(user, "procurement.procurementrequest.operate") &&
    can(user, permission)
  );
}

export function formatHumanValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const raw = String(value);
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(raw))
    return `#${raw.replaceAll("-", "").slice(0, 6).toUpperCase()}`;
  if (/^[0-9A-F]{20,}$/i.test(raw)) return `#${raw.slice(0, 6).toUpperCase()}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw))
    return new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(
      new Date(`${raw}T12:00:00`),
    );
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw))
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(raw));
  if (/^-?\d+\.\d+$/.test(raw))
    return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 4 }).format(
      Number(raw),
    );
  return raw;
}
export function fieldDisplay(row: Entity, key: string): string {
  const related = row.related_labels;
  if (related && typeof related === "object" && key in related)
    return String((related as Record<string, unknown>)[key]);
  return formatHumanValue(row[key]);
}
