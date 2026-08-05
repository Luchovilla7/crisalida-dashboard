"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { agency } from "@/config/agency";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { getService } from "@/lib/config-helpers";
import { formatDate, formatMoney } from "@/lib/format";
import type { Client, Payment, Service } from "@/lib/types";
import { PaymentForm } from "./payment-form";

export function PaymentsTable({ payments, clients, services }: { payments: Payment[]; clients: Client[]; services?: Service[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  function clientName(id: string | null) {
    return clients.find((c) => c.id === id)?.name ?? "Sin cliente";
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">Facturas y pagos</h2>
        <Button
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={14} /> {agency.copy.cta.newPayment}
        </Button>
      </div>

      {payments.length === 0 ? (
        <EmptyState message={agency.copy.emptyStates.payments} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-inkmuted">
                <th className="pb-2 pr-4 font-medium">Cliente</th>
                <th className="pb-2 pr-4 font-medium">Servicio</th>
                <th className="pb-2 pr-4 font-medium">Mes</th>
                <th className="pb-2 pr-4 font-medium">Monto</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2 pr-4 text-ink">{clientName(p.client_id)}</td>
                  <td className="py-2 pr-4 text-inkmuted">{getService(p.service_id, services)?.name ?? "—"}</td>
                  <td className="py-2 pr-4 text-inkmuted">{formatDate(p.month)}</td>
                  <td className="py-2 pr-4 font-medium text-ink">{formatMoney(p.amount, p.currency)}</td>
                  <td className="py-2 pr-4">
                    <Badge
                      label={p.status === "cobrado" ? "Cobrado" : "Pendiente"}
                      color={p.status === "cobrado" ? "#34D399" : "#FBBF24"}
                    />
                  </td>
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

      <PaymentForm key={editing?.id ?? "new"} open={open} onClose={() => setOpen(false)} payment={editing} clients={clients} services={services} />
    </Card>
  );
}
