import { CalendarClock, FolderKanban, ListTodo } from "lucide-react";
import { agency } from "@/config/agency";
import { Card, EmptyState } from "@/components/ui";
import { getProjects, getTasks } from "@/lib/queries";
import { upcomingDeadlines } from "@/lib/metrics";
import { formatDate } from "@/lib/format";

export default async function CalendarioPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);
  const deadlines = upcomingDeadlines(tasks, projects);

  const groups = new Map<string, typeof deadlines>();
  for (const item of deadlines) {
    const key = formatDate(item.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return (
    <div className="space-y-4">
      {deadlines.length === 0 ? (
        <EmptyState message={agency.copy.emptyStates.calendar} />
      ) : (
        Array.from(groups.entries()).map(([date, items]) => (
          <Card key={date} className="flex gap-4">
            <div className="w-24 shrink-0 pt-0.5">
              <p className="text-sm font-semibold text-ink">{date}</p>
              {items[0].overdue && <p className="text-xs font-medium text-red-500">Vencido</p>}
            </div>
            <div className="flex-1 space-y-2 border-l border-line pl-4">
              {items.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex items-center gap-2 text-sm">
                  {item.kind === "tarea" ? (
                    <ListTodo size={15} className="shrink-0 text-inkmuted" />
                  ) : (
                    <FolderKanban size={15} className="shrink-0 text-inkmuted" />
                  )}
                  <span className="text-ink">{item.title}</span>
                  <span className="text-xs text-inkmuted">
                    · {item.kind === "tarea" ? "tarea" : "entrega de proyecto"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      <Card className="flex items-start gap-3 bg-line/20">
        <CalendarClock size={16} className="mt-0.5 shrink-0 text-inkmuted" />
        <p className="text-xs text-inkmuted">
          Esta vista junta fechas límite de tareas y entregas de proyectos. Si querés sumar reuniones con clientes como
          un tercer tipo de evento, es un buen candidato para el próximo módulo (ver instrucciones de extensión en el
          README).
        </p>
      </Card>
    </div>
  );
}
