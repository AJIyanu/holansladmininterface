export function formatDate(value: string | null, includeTime = false): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
  }).format(new Date(value));
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export function formatQuantity(quantity: string, unit: string): string {
  const value = Number(quantity);
  return `${Number.isFinite(value) ? value.toLocaleString("en-NG") : quantity} ${unit}`;
}
