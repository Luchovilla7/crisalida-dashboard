import "server-only";
import type { Client, Payment, Service } from "@/lib/types";
import { agency } from "@/config/agency";
import { getService } from "@/lib/config-helpers";
import { monthLabel, parseDateOnly } from "@/lib/format";

export function monthlySeries(payments: Payment[], months = 6) {
  const now = new Date();
  const buckets: { key: string; label: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), total: 0 });
  }
  for (const p of payments) {
    if (p.status !== "cobrado") continue;
    const d = parseDateOnly(p.month);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.total += Number(p.amount);
  }
  return buckets.map(({ label, total }) => ({ label, total }));
}

export function byService(payments: Payment[], servicesList?: Service[]) {
  const totals = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "cobrado") continue;
    const key = p.service_id ?? "otro";
    totals.set(key, (totals.get(key) ?? 0) + Number(p.amount));
  }
  return Array.from(totals.entries())
    .map(([id, total]) => ({ name: getService(id, servicesList)?.name ?? "Otro", total }))
    .sort((a, b) => b.total - a.total);
}

export function byClient(payments: Payment[], clients: Client[]) {
  const totals = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "cobrado") continue;
    const key = p.client_id ?? "otro";
    totals.set(key, (totals.get(key) ?? 0) + Number(p.amount));
  }
  return Array.from(totals.entries())
    .map(([id, total]) => ({ name: clients.find((c) => c.id === id)?.name ?? "Otro", total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

export function pendingVsCollected(payments: Payment[]) {
  let pending = 0;
  let collected = 0;
  for (const p of payments) {
    if (p.status === "pendiente") pending += Number(p.amount);
    else collected += Number(p.amount);
  }
  return { pending, collected };
}

export function estimatedMrr(clients: Client[], servicesList?: Service[]) {
  const list = servicesList ?? agency.services;
  const retainerIds = new Set(list.filter((s) => s.type === "retainer").map((s) => s.id));
  return clients
    .filter((c) => c.status === "activo" && c.service_ids.some((id) => retainerIds.has(id)))
    .reduce((sum, c) => sum + Number(c.contract_value), 0);
}
