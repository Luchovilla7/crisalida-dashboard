import { Info } from "lucide-react";
import { agency } from "@/config/agency";
import { Card } from "@/components/ui";
import { getClients } from "@/lib/queries";

export default async function ServiciosPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-3 bg-brand-primary/5">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-primary" />
        <p className="text-sm text-ink">
          Este catálogo se edita en <code className="rounded bg-ink/10 px-1.5 py-0.5 text-xs">config/agency.ts</code>{" "}
          (array <code className="rounded bg-ink/10 px-1.5 py-0.5 text-xs">services</code>). Agregá,
          quitá o editá filas ahí y los selectores de servicio en Clientes y Pipeline se actualizan solos.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agency.services.map((service) => {
          const activeClients = clients.filter(
            (c) => c.service_ids.includes(service.id) && c.status === "activo"
          ).length;
          return (
            <Card key={service.id} className="flex flex-col gap-3">
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
              <p className="text-sm text-inkmuted">{service.description}</p>
              <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm font-medium text-ink">{service.price}</span>
                <span className="text-xs text-inkmuted">{activeClients} cliente(s) activo(s)</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
