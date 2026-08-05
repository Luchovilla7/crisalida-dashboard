"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agency } from "@/config/agency";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { createClient, updateClient, type ClientInput } from "@/lib/actions";
import type { Client, Service } from "@/lib/types";

export function ClientForm({
  open,
  onClose,
  client,
  services,
}: {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  services?: Service[];
}) {
  const router = useRouter();
  const servicesList = services ?? (agency.services as Service[]);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ClientInput>(() => ({
    name: client?.name ?? "",
    business_name: client?.business_name ?? "",
    service_ids: client?.service_ids ?? [],
    status: client?.status ?? agency.clientStatuses[0].id,
    contract_value: client?.contract_value ?? 0,
    start_date: client?.start_date ?? "",
    assigned_to: client?.assigned_to ?? "",
    notes: client?.notes ?? "",
  }));

  function toggleService(id: string) {
    setForm((f) => ({
      ...f,
      service_ids: f.service_ids.includes(id) ? f.service_ids.filter((s) => s !== id) : [...f.service_ids, id],
    }));
  }

  function submit() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (client) {
        await updateClient(client.id, form);
      } else {
        await createClient(form);
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? "Editar cliente" : agency.copy.cta.newClient}>
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
          <Field label="Estado">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {agency.clientStatuses.map((s) => (
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

        <Field label="Servicio(s) contratado(s)">
          <div className="flex flex-wrap gap-2">
            {servicesList.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  form.service_ids.includes(s.id)
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-line text-ink hover:bg-ink/5"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Valor del contrato (${agency.currency})`}>
            <Input
              type="number"
              min={0}
              value={form.contract_value}
              onChange={(e) => setForm({ ...form, contract_value: Number(e.target.value) })}
            />
          </Field>
          <Field label="Fecha de inicio">
            <Input
              type="date"
              value={form.start_date ?? ""}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Notas">
          <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            {agency.copy.cta.cancel}
          </Button>
          <Button variant="primary" onClick={submit} disabled={pending}>
            {agency.copy.cta.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
