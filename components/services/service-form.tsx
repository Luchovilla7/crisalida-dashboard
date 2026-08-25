"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agency } from "@/config/agency";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { createService, updateService, type ServiceInput } from "@/lib/actions";
import type { Service } from "@/lib/types";

export function ServiceForm({
  open,
  onClose,
  service,
}: {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ServiceInput>(() => ({
    name: service?.name ?? "",
    description: service?.description ?? "",
    price: service?.price ?? "",
    currency: service?.currency ?? agency.currency,
    type: service?.type ?? "proyecto",
  }));

  function submit() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (service && service.id) {
        await updateService(service.id, form);
      } else {
        await createService(form);
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={service ? "Editar servicio" : "Nuevo servicio"}>
      <div className="space-y-4">
        <Field label="Nombre del servicio *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Chatbots / Agentes IA"
            autoFocus
          />
        </Field>

        <Field label="Tipo de servicio">
          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "proyecto" | "retainer" })}
          >
            <option value="proyecto">Proyecto único</option>
            <option value="retainer">Retainer mensual</option>
          </Select>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Precio o tarifa" className="col-span-2">
            <Input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Ej: Desde 400.000 o 450.000 / mes"
            />
          </Field>

          <Field label="Moneda">
            <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {agency.currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Descripción">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción corta del servicio que se ofrece..."
          />
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
