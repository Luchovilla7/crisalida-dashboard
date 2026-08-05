"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agency } from "@/config/agency";
import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { createPayment, deletePayment, updatePayment, type PaymentInput } from "@/lib/actions";
import type { Client, Payment, Service } from "@/lib/types";

function toMonthInput(dateStr: string) {
  return dateStr ? dateStr.slice(0, 7) : "";
}
function fromMonthInput(value: string) {
  return value ? `${value}-01` : new Date().toISOString().slice(0, 7) + "-01";
}

export function PaymentForm({
  open,
  onClose,
  payment,
  clients,
  services,
}: {
  open: boolean;
  onClose: () => void;
  payment?: Payment | null;
  clients: Client[];
  services?: Service[];
}) {
  const router = useRouter();
  const servicesList = services ?? (agency.services as Service[]);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PaymentInput>(() => ({
    client_id: payment?.client_id ?? "",
    service_id: payment?.service_id ?? "",
    amount: payment?.amount ?? 0,
    month: payment?.month ?? new Date().toISOString().slice(0, 7) + "-01",
    status: payment?.status ?? "pendiente",
    is_retainer: payment?.is_retainer ?? false,
  }));

  function submit() {
    if (form.amount <= 0) return;
    startTransition(async () => {
      if (payment) {
        await updatePayment(payment.id, form);
      } else {
        await createPayment(form);
      }
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!payment) return;
    if (!confirm("¿Eliminar este pago/factura?")) return;
    startTransition(async () => {
      await deletePayment(payment.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={payment ? "Editar pago" : agency.copy.cta.newPayment}>
      <div className="space-y-4">
        <Field label="Cliente">
          <Select value={form.client_id ?? ""} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="">Sin cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Servicio">
          <Select value={form.service_id ?? ""} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
            <option value="">Sin definir</option>
            {servicesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Monto (${agency.currency})`}>
            <Input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Mes">
            <Input
              type="month"
              value={toMonthInput(form.month)}
              onChange={(e) => setForm({ ...form, month: fromMonthInput(e.target.value) })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PaymentInput["status"] })}
            >
              <option value="pendiente">Pendiente</option>
              <option value="cobrado">Cobrado</option>
            </Select>
          </Field>
          <Field label="Tipo">
            <label className="flex h-[38px] items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.is_retainer}
                onChange={(e) => setForm({ ...form, is_retainer: e.target.checked })}
                className="h-4 w-4 accent-brand-primary"
              />
              Es retainer mensual
            </label>
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          {payment ? (
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
