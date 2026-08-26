"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { agency } from "@/config/agency";
import { Button, Card, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Client, Project } from "@/lib/types";
import { ProjectForm } from "./project-form";

const STATUS_LABEL: Record<string, string> = { activo: "Activo", "en-pausa": "En pausa", finalizado: "Finalizado" };

export function ProjectList({ projects, clients }: { projects: Project[]; clients: Client[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const projectId = searchParams.get("project");
    if (!projectId) return;
    rowRefs.current[projectId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlighted(projectId);
    router.replace("/proyectos", { scroll: false });
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlighted(null), 2500);
    // Deliberately no cleanup here: router.replace() below changes searchParams,
    // re-running this effect with projectId now null. A cleanup tied to that
    // re-run would cancel the fade timer before it ever fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

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
                <tr
                  key={p.id}
                  ref={(el) => {
                    rowRefs.current[p.id] = el;
                  }}
                  className={cn(
                    "border-b border-line/60 last:border-0 transition-colors",
                    highlighted === p.id && "bg-brand-primary/10"
                  )}
                >
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
