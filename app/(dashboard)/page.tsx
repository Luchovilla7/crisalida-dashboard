import { Users, FolderKanban, Wallet, ListTodo, CalendarClock } from "lucide-react";
import { getActivity, getClients, getPayments, getProjects, getTasks } from "@/lib/queries";
import { formatMoney, formatRelative, formatDate } from "@/lib/format";
import { monthlyRevenue, taskIsOverdue, taskIsPending, upcomingDeadlines, withinDays } from "@/lib/metrics";
import { agency } from "@/config/agency";
import { Card, EmptyState, KpiCard } from "@/components/ui";

export default async function OverviewPage() {
  const [clients, projects, tasks, payments, activity] = await Promise.all([
    getClients(),
    getProjects(),
    getTasks(),
    getPayments(),
    getActivity(12),
  ]);

  const activeClients = clients.filter((c) => c.status === "activo").length;
  const activeProjects = projects.filter((p) => p.status === "activo").length;
  const revenueByCurrency = monthlyRevenue(payments);
  const revenue =
    revenueByCurrency.size > 0
      ? Array.from(revenueByCurrency.entries())
          .map(([currency, total]) => formatMoney(total, currency))
          .join(" · ")
      : formatMoney(0);
  const pendingTasks = tasks.filter(taskIsPending);
  const overdueTasks = tasks.filter(taskIsOverdue);
  const deadlines = upcomingDeadlines(tasks, projects);
  const next7 = withinDays(deadlines, 7);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Clientes activos" value={String(activeClients)} icon={<Users size={18} />} />
        <KpiCard label="Proyectos en curso" value={String(activeProjects)} icon={<FolderKanban size={18} />} />
        <KpiCard label="Ingresos del mes" value={revenue} icon={<Wallet size={18} />} />
        <KpiCard
          label="Tareas pendientes"
          value={String(pendingTasks.length)}
          icon={<ListTodo size={18} />}
          hint={overdueTasks.length > 0 ? `${overdueTasks.length} vencida(s)` : "Ninguna vencida"}
        />
        <KpiCard
          label="Próximos deadlines"
          value={String(next7.length)}
          icon={<CalendarClock size={18} />}
          hint={next7[0] ? `${next7[0].title} · ${formatDate(next7[0].date)}` : "Nada en 7 días"}
        />
      </div>

      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Actividad reciente</h2>
        {activity.length === 0 ? (
          <EmptyState message={agency.copy.emptyStates.activity} />
        ) : (
          <ul className="space-y-3">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-ink">{item.message}</span>
                <span className="shrink-0 text-xs text-inkmuted">{formatRelative(item.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
