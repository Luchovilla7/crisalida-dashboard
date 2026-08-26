import { Shell } from "@/components/shell";
import { getClients, getProjects, getTasks, getPayments } from "@/lib/queries";
import { taskIsOverdue } from "@/lib/metrics";

// Todas las paginas del dashboard leen datos en vivo de Supabase: nunca deben
// pre-renderizarse como estaticas en build time.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [clients, projects, tasks, payments] = await Promise.all([
    getClients(),
    getProjects(),
    getTasks(),
    getPayments(),
  ]);

  const overdueTasks = tasks.filter(taskIsOverdue).length;
  const pendingPayments = payments.filter((p) => p.status === "pendiente").length;

  return (
    <Shell
      overdueTasks={overdueTasks}
      pendingPayments={pendingPayments}
      searchClients={clients.map((c) => ({ id: c.id, name: c.name, business_name: c.business_name }))}
      searchProjects={projects.map((p) => ({ id: p.id, name: p.name }))}
      searchTasks={tasks.map((t) => ({ id: t.id, title: t.title }))}
    >
      {children}
    </Shell>
  );
}
