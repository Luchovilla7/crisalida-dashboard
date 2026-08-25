"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { agency } from "@/config/agency";
import { KanbanBoard } from "@/components/kanban-board";
import { Avatar, Badge, Button } from "@/components/ui";
import { getPriority, getTeamMember } from "@/lib/config-helpers";
import { formatDateShort } from "@/lib/format";
import { taskIsOverdue } from "@/lib/metrics";
import { moveTask } from "@/lib/actions";
import type { Client, Project, Task } from "@/lib/types";
import { TaskForm } from "./task-form";

export function TaskBoard({ tasks, projects, clients }: { tasks: Task[]; projects: Project[]; clients: Client[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [initialStage, setInitialStage] = useState<string | undefined>();

  function openNew(stageId: string) {
    setEditing(null);
    setInitialStage(stageId);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  function projectName(id: string | null) {
    return projects.find((p) => p.id === id)?.name;
  }
  function clientName(id: string | null) {
    return clients.find((c) => c.id === id)?.name;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={() => openNew(agency.taskStages[0].id)}>
          <Plus size={16} /> {agency.copy.cta.newTask}
        </Button>
      </div>

      <KanbanBoard
        stages={agency.taskStages}
        items={tasks}
        emptyMessage={agency.copy.emptyStates.tasks}
        onMove={async (id, stageId, position) => {
          const t = tasks.find((x) => x.id === id);
          await moveTask(id, stageId, position, t?.title);
          router.refresh();
        }}
        renderCard={(task) => {
          const assignee = getTeamMember(task.assigned_to);
          const priority = getPriority(task.priority);
          const checklist = task.checklist ?? [];
          const done = checklist.filter((i) => i.done).length;
          const overdue = taskIsOverdue(task);
          const project = projectName(task.project_id);
          const client = clientName(task.client_id);
          return (
            <button
              onClick={() => openEdit(task)}
              className="w-full rounded-xl border border-line bg-surface p-3 text-left shadow-sm transition hover:border-brand-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <Badge label={priority.label} color={priority.color} />
              </div>
              {project && <p className="mt-1 text-xs text-inkmuted">{project}</p>}
              {client && <p className="text-[11px] text-inkmuted/80">{client}</p>}
              {checklist.length > 0 && (
                <p className="mt-2 text-[11px] text-inkmuted">
                  {done}/{checklist.length} completados
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[11px] ${overdue ? "font-medium text-red-500" : "text-inkmuted"}`}>
                  {formatDateShort(task.due_date)}
                </span>
                {assignee && <Avatar name={assignee.name} color={assignee.color} />}
              </div>
            </button>
          );
        }}
        columnFooter={(stageId) => (
          <button
            onClick={() => openNew(stageId)}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2 text-xs text-inkmuted hover:border-brand-primary/40 hover:text-brand-primary"
          >
            <Plus size={13} /> Agregar
          </button>
        )}
      />

      <TaskForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        projects={projects}
        clients={clients}
        initialStage={initialStage}
      />
    </div>
  );
}
