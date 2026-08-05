"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { deleteService } from "@/lib/actions";
import type { Client, Service } from "@/lib/types";
import { ServiceForm } from "./service-form";

export function ServicesManager({
  services,
  clients,
}: {
  services: Service[];
  clients: Client[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleDelete(service: Service) {
    if (!confirm(`¿Eliminar el servicio "${service.name}"?`)) return;
    startTransition(async () => {
      await deleteService(service.id, service.name);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Catálogo de Servicios</h2>
          <p className="text-xs text-inkmuted">
            Gestioná los servicios de la agencia. Las modificaciones quedan registradas automáticamente.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          <Plus size={16} />
          Nuevo servicio
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const activeClients = clients.filter(
            (c) => c.service_ids?.includes(service.id) && c.status === "activo"
          ).length;

          return (
            <Card key={service.id} className="flex flex-col gap-3 relative group">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-ink">{service.name}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    service.type === "retainer" ? "bg-brand-accent/15 text-brand-accent" : "bg-line/40 text-ink"
                  }`}
                >
                  {service.type === "retainer" ? "Retainer mensual" : "Proyecto único"}
                </span>
              </div>

              <p className="text-sm text-inkmuted">{service.description || "Sin descripción"}</p>

              <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm font-medium text-ink">{service.price || "Sin precio"}</span>
                <span className="text-xs text-inkmuted">{activeClients} cliente(s) activo(s)</span>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-line/40">
                <button
                  type="button"
                  onClick={() => setEditingService(service)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-inkmuted hover:bg-ink/5 hover:text-ink transition"
                >
                  <Edit2 size={13} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(service)}
                  disabled={pending}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {isCreating && (
        <ServiceForm
          open={isCreating}
          onClose={() => setIsCreating(false)}
        />
      )}

      {editingService && (
        <ServiceForm
          open={Boolean(editingService)}
          onClose={() => setEditingService(null)}
          service={editingService}
        />
      )}
    </div>
  );
}
