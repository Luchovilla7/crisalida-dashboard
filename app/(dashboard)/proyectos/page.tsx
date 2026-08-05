import { getClients, getProjects, getTasks } from "@/lib/queries";
import { ProjectList } from "@/components/projects/project-list";
import { TaskBoard } from "@/components/tasks/task-board";

export default async function ProyectosPage() {
  const [projects, tasks, clients] = await Promise.all([getProjects(), getTasks(), getClients()]);

  return (
    <div className="space-y-6">
      <ProjectList projects={projects} clients={clients} />
      <TaskBoard tasks={tasks} projects={projects} clients={clients} />
    </div>
  );
}
