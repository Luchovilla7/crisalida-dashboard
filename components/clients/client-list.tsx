"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { agency } from "@/config/agency";
import { Badge, Button, EmptyState } from "@/components/ui";
import { getClientStatus, getService, getTeamMember } from "@/lib/config-helpers";
import { formatDate, formatMoney } from "@/lib/format";
import { deleteClient } from "@/lib/actions";
import type { Client } from "@/lib/types";
import { ClientForm } from "./client-form";

export function ClientList({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(client: Client, e: React.MouseEvent) {
    e.preventDefault();
    setEditing(client);
    setFormOpen(true);
  }

  function remove(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await deleteClient(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={openNew}>
          <Plus size={16} /> {agency.copy.cta.newClient}
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          message={agency.copy.emptyStates.clients}
          action={
            <Button variant="primary" onClick={openNew}>
              <Plus size={16} /> {agency.copy.cta.newClient}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => {
            const status = getClientStatus(client.status);
            const responsible = getTeamMember(client.assigned_to);
            return (
              <Link
                key={client.id}
                href={`/clientes/${client.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{client.name}</p>
                    {client.business_name && <p className="truncate text-xs text-inkmuted">{client.business_name}</p>}
                  </div>
                  <Badge label={status.label} color={status.color} />
                </div>

                {client.service_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {client.service_ids.map((id) => {
                      const svc = getService(id);
                      return svc ? (
                        <span key={id} className="rounded-full bg-line/40 px-2 py-0.5 text-[11px] text-ink">
                          {svc.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-inkmuted">
                  <span>{formatMoney(client.contract_value)}</span>
                  <span>{formatDate(client.start_date)}</span>
                </div>

                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="text-xs text-inkmuted">{responsible ? responsible.name : "Sin asignar"}</span>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={(e) => openEdit(client, e)}
                      className="rounded-lg p-1.5 text-inkmuted hover:bg-ink/5 hover:text-ink"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => remove(client.id, e)}
                      className="rounded-lg p-1.5 text-inkmuted hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ClientForm key={editing?.id ?? "new"} open={formOpen} onClose={() => setFormOpen(false)} client={editing} />
    </div>
  );
}
