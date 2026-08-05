import type { Payment, Project, Task } from "@/lib/types";
import { agency } from "@/config/agency";
import { parseDateOnly } from "@/lib/format";

export function isCurrentMonth(dateStr: string) {
  const d = parseDateOnly(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function monthlyRevenue(payments: Payment[]) {
  const totals = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "cobrado" || !isCurrentMonth(p.month)) continue;
    totals.set(p.currency, (totals.get(p.currency) ?? 0) + Number(p.amount));
  }
  return totals;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isOverdue(dueDate: string | null, doneStageId: string, stageId: string) {
  if (!dueDate || stageId === doneStageId) return false;
  return parseDateOnly(dueDate) < today();
}

const doneStage = agency.taskStages[agency.taskStages.length - 1].id;

export function taskIsOverdue(task: Task) {
  return isOverdue(task.due_date, doneStage, task.stage_id);
}

export function taskIsPending(task: Task) {
  return task.stage_id !== doneStage;
}

export type DeadlineItem = {
  id: string;
  kind: "tarea" | "proyecto";
  title: string;
  date: string;
  overdue: boolean;
};

export function upcomingDeadlines(tasks: Task[], projects: Project[]): DeadlineItem[] {
  const items: DeadlineItem[] = [];

  for (const t of tasks) {
    if (!t.due_date || t.stage_id === doneStage) continue;
    items.push({ id: t.id, kind: "tarea", title: t.title, date: t.due_date, overdue: taskIsOverdue(t) });
  }
  for (const p of projects) {
    if (!p.due_date || p.status === "finalizado") continue;
    items.push({
      id: p.id,
      kind: "proyecto",
      title: p.name,
      date: p.due_date,
      overdue: parseDateOnly(p.due_date) < today(),
    });
  }

  return items.sort((a, b) => parseDateOnly(a.date).getTime() - parseDateOnly(b.date).getTime());
}

export function withinDays(deadlines: DeadlineItem[], days: number) {
  const now = Date.now();
  return deadlines.filter((d) => (parseDateOnly(d.date).getTime() - now) / 86400000 <= days);
}
