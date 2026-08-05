"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { agency } from "@/config/agency";
import { KanbanBoard } from "@/components/kanban-board";
import { Avatar, Button } from "@/components/ui";
import { getService, getTeamMember } from "@/lib/config-helpers";
import { formatMoney } from "@/lib/format";
import { moveLead } from "@/lib/actions";
import type { Lead, Service } from "@/lib/types";
import { LeadForm } from "./lead-form";

export function PipelineBoard({ leads, services }: { leads: Lead[]; services?: Service[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [initialStage, setInitialStage] = useState<string | undefined>();

  function openNew(stageId: string) {
    setEditing(null);
    setInitialStage(stageId);
    setFormOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={() => openNew(agency.pipelineStages[0].id)}>
          <Plus size={16} /> {agency.copy.cta.newLead}
        </Button>
      </div>

      <KanbanBoard
        stages={agency.pipelineStages}
        items={leads}
        emptyMessage={agency.copy.emptyStates.leads}
        onMove={async (id, stageId, position) => {
          await moveLead(id, stageId, position);
          router.refresh();
        }}
        renderCard={(lead) => {
          const responsible = getTeamMember(lead.assigned_to);
          const service = getService(lead.service_id, services);
          return (
            <button
              onClick={() => openEdit(lead)}
              className="w-full rounded-xl border border-line bg-surface p-3 text-left shadow-sm transition hover:border-brand-primary/40"
            >
              <p className="text-sm font-medium text-ink">{lead.name}</p>
              {lead.business_name && <p className="text-xs text-inkmuted">{lead.business_name}</p>}
              {service && (
                <span className="mt-2 inline-block rounded-full bg-line/40 px-2 py-0.5 text-[11px] text-ink">
                  {service.name}
                </span>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-ink">{formatMoney(lead.estimated_value)}</span>
                <span className="text-[11px] text-inkmuted">{lead.probability}%</span>
              </div>
              {responsible && (
                <div className="mt-2 flex justify-end">
                  <Avatar name={responsible.name} color={responsible.color} />
                </div>
              )}
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

      <LeadForm key={editing?.id ?? "new"} open={formOpen} onClose={() => setFormOpen(false)} lead={editing} initialStage={initialStage} services={services} />
    </div>
  );
}
