import { agency } from "@/config/agency";

// Postgres "date" columns (start_date, due_date, month) come back as plain
// "YYYY-MM-DD" strings with no time/zone. `new Date("YYYY-MM-DD")` parses
// that as UTC midnight, which then reads back one day earlier in any
// negative-UTC-offset timezone (e.g. Argentina). Parsing the components
// directly into local time avoids that off-by-one-day shift.
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatMoney(amount: number, currency: string = agency.currency) {
  return new Intl.NumberFormat(agency.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? parseDateOnly(date) : date;
  return new Intl.DateTimeFormat(agency.locale, { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function formatDateShort(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? parseDateOnly(date) : date;
  return new Intl.DateTimeFormat(agency.locale, { day: "2-digit", month: "short" }).format(d);
}

export function formatRelative(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `hace ${diffDay} d`;
  return formatDate(d);
}

export function monthLabel(date: string | Date) {
  const d = typeof date === "string" ? parseDateOnly(date) : date;
  return new Intl.DateTimeFormat(agency.locale, { month: "short", year: "2-digit" }).format(d);
}
