import { Info } from "lucide-react";
import { agency } from "@/config/agency";
import { Avatar, Card } from "@/components/ui";
import { getTasks } from "@/lib/queries";
import { taskIsOverdue, taskIsPending } from "@/lib/metrics";

export default async function EquipoPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-3 bg-brand-primary/5">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-primary" />
        <p className="text-sm text-ink">
          El equipo se edita en <code className="rounded bg-ink/10 px-1.5 py-0.5 text-xs">config/agency.ts</code>{" "}
          (array <code className="rounded bg-ink/10 px-1.5 py-0.5 text-xs">team</code>). Podés agregar
          tantas personas como quieras, no hay límite.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agency.team.map((member) => {
          const memberTasks = tasks.filter((t) => t.assigned_to === member.id);
          const active = memberTasks.filter(taskIsPending);
          const overdue = memberTasks.filter(taskIsOverdue);
          return (
            <Card key={member.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} color={member.color} size="md" />
                <div>
                  <p className="text-sm font-semibold text-ink">{member.name}</p>
                  <p className="text-xs text-inkmuted">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <div>
                  <p className="text-xs text-inkmuted">Tareas activas</p>
                  <p className="text-lg font-semibold text-ink">{active.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-inkmuted">Vencidas</p>
                  <p className={`text-lg font-semibold ${overdue.length > 0 ? "text-red-500" : "text-ink"}`}>
                    {overdue.length}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
