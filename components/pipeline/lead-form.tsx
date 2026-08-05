"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agency } from "@/config/agency";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { createLead, deleteLead, updateLead, type LeadInput } from "@/lib/actions";
import type { Lead } from "@/lib/types";

export function LeadForm({
  open,
  onClose,
  lead,
  initialStage,
}: {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
  initialStage?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<LeadInput>(() => ({
    name: lead?.name ?? "",
    business_name: lead?.business_name ?? "",
    stage_id: lead?.stage_id ?? initialStage ?? agency.pipelineStages[0].id,
    estimated_value: lead?.estimated_value ?? 0,
    probability: lead?.probability ?? 50,
    assigned_to: lead?.assigned_to ?? "",
    service_id: lead?.service_id ?? "",
    notes: lead?.notes ?? "",
  }));

  function submit() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (lead) {
        await updateLead(lead.id, form);
      } else {
        await createLead(form);
      }
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!lead) return;
    if (!confirm("¿Eliminar este prospecto?")) return;
    startTransition(async () => {
      await deleteLead(lead.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={lead ? "Editar prospecto" : agency.copy.cta.newLead}>
      <div className="space-y-4">
        <Field label="Nombre *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </Field>
        <Field label="Marca / negocio">
          <Input
            value={form.business_name ?? ""}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Columna">
            <Select value={form.stage_id} onChange={(e) => setForm({ ...form, stage_id: e.target.value })}>
              {agency.pipelineStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Responsable">
            <Select value={form.assigned_to ?? ""} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Sin asignar</option>
              {agency.team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Servicio de interés">
          <Select value={form.service_id ?? ""} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
            <option value="">Sin definir</option>
            {agency.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Valor estimado (${agency.currency})`}>
            <Input
              type="number"
              min={0}
              value={form.estimated_value}
              onChange={(e) => setForm({ ...form, estimated_value: Number(e.target.value) })}
            />
          </Field>
          <Field label="Probabilidad de cierre (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.probability}
              onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
            />
          </Field>
        </div>

        <Field label="Notas">
          <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>

        <div className="flex items-center justify-between pt-2">
          {lead ? (
            <Button variant="danger" onClick={remove} disabled={pending}>
              {agency.copy.cta.delete}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {agency.copy.cta.cancel}
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending}>
              {agency.copy.cta.save}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
