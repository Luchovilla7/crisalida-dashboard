"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { agency } from "@/config/agency";
import { Button, Card, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Client, Project } from "@/lib/types";
import { ProjectForm } from "./project-form";

const STATUS_LABEL: Record<string, string> = { activo: "Activo", "en-pausa": "En pausa", finalizado: "Finalizado" };

export function ProjectList({ projects, clients }: { projects: Project[]; clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  function clientName(id: string | null) {
    return clients.find((c) => c.id === id)?.name ?? "Sin cliente";
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">Proyectos</h2>
        <Button
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={14} /> {agency.copy.cta.newProject}
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState message={agency.copy.emptyStates.projects} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-inkmuted">
                <th className="pb-2 pr-4 font-medium">Proyecto</th>
                <th className="pb-2 pr-4 font-medium">Cliente</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 pr-4 font-medium">Entrega</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2 pr-4 font-medium text-ink">{p.name}</td>
                  <td className="py-2 pr-4 text-inkmuted">{clientName(p.client_id)}</td>
                  <td className="py-2 pr-4 text-inkmuted">{STATUS_LABEL[p.status] ?? p.status}</td>
                  <td className="py-2 pr-4 text-inkmuted">{formatDate(p.due_date)}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-inkmuted hover:bg-ink/5 hover:text-ink"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectForm key={editing?.id ?? "new"} open={open} onClose={() => setOpen(false)} project={editing} clients={clients} />
    </Card>
  );
}
