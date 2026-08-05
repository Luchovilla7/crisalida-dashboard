import { Repeat, TrendingDown, TrendingUp } from "lucide-react";
import { getClients, getPayments, getServices } from "@/lib/queries";
import { byClient, byService, estimatedMrr, monthlySeries, pendingVsCollected } from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import { KpiCard } from "@/components/ui";
import { MonthlyRevenueChart, BreakdownChart } from "@/components/finance/finance-charts";
import { PaymentsTable } from "@/components/finance/payments-table";

export default async function FinanzasPage() {
  const [payments, clients, servicesList] = await Promise.all([getPayments(), getClients(), getServices()]);

  const monthly = monthlySeries(payments);
  const services = byService(payments, servicesList);
  const perClient = byClient(payments, clients);
  const { pending, collected } = pendingVsCollected(payments);
  const mrr = estimatedMrr(clients, servicesList);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MRR estimado" value={formatMoney(mrr)} icon={<Repeat size={18} />} hint="Contratos retainer activos" />
        <KpiCard label="Cobrado" value={formatMoney(collected)} icon={<TrendingUp size={18} />} />
        <KpiCard label="Pendiente de cobro" value={formatMoney(pending)} icon={<TrendingDown size={18} />} />
        <KpiCard label="Total facturado" value={formatMoney(pending + collected)} />
      </div>

      <MonthlyRevenueChart data={monthly} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownChart title="Ingresos por servicio" data={services} />
        <BreakdownChart title="Ingresos por cliente" data={perClient} />
      </div>

      <PaymentsTable payments={payments} clients={clients} services={servicesList} />
    </div>
  );
}
