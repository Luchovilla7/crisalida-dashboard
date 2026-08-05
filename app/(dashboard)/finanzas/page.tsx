import { Repeat, TrendingDown, TrendingUp } from "lucide-react";
import { agency } from "@/config/agency";
import { getClients, getPayments, getServices } from "@/lib/queries";
import { byClient, byService, estimatedMrr, monthlySeries, pendingVsCollected } from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import { KpiCard } from "@/components/ui";
import { MonthlyRevenueChart, BreakdownChart } from "@/components/finance/finance-charts";
import { PaymentsTable } from "@/components/finance/payments-table";

export default async function FinanzasPage() {
  const [payments, clients, servicesList] = await Promise.all([getPayments(), getClients(), getServices()]);

  // Cada cliente/pago tiene su propia moneda: los totales se muestran separados
  // por moneda (ARS y USD no se suman entre sí).
  const currencies = agency.currencies.filter(
    (c) => c.id === agency.currency || payments.some((p) => p.currency === c.id) || clients.some((cl) => cl.currency === c.id)
  );

  return (
    <div className="space-y-8">
      {currencies.map((currency) => {
        const currencyPayments = payments.filter((p) => p.currency === currency.id);
        const currencyClients = clients.filter((c) => c.currency === currency.id);

        const monthly = monthlySeries(currencyPayments);
        const services = byService(currencyPayments, servicesList);
        const perClient = byClient(currencyPayments, clients);
        const { pending, collected } = pendingVsCollected(currencyPayments);
        const mrr = estimatedMrr(currencyClients, servicesList);

        return (
          <section key={currency.id} className="space-y-6">
            <h2 className="font-display text-sm font-semibold text-inkmuted">{currency.label}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="MRR estimado"
                value={formatMoney(mrr, currency.id)}
                icon={<Repeat size={18} />}
                hint="Contratos retainer activos"
              />
              <KpiCard label="Cobrado" value={formatMoney(collected, currency.id)} icon={<TrendingUp size={18} />} />
              <KpiCard
                label="Pendiente de cobro"
                value={formatMoney(pending, currency.id)}
                icon={<TrendingDown size={18} />}
              />
              <KpiCard label="Total facturado" value={formatMoney(pending + collected, currency.id)} />
            </div>

            <MonthlyRevenueChart data={monthly} currency={currency.id} title={`Ingresos por mes (${currency.id})`} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BreakdownChart title="Ingresos por servicio" data={services} currency={currency.id} />
              <BreakdownChart title="Ingresos por cliente" data={perClient} currency={currency.id} />
            </div>
          </section>
        );
      })}

      <PaymentsTable payments={payments} clients={clients} services={servicesList} />
    </div>
  );
}
