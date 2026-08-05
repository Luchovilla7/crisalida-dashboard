"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { agency } from "@/config/agency";
import { Card } from "@/components/ui";
import { formatMoney } from "@/lib/format";

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-ink">{label}</p>
      <p className="text-inkmuted">{formatMoney(payload[0].value, currency)}</p>
    </div>
  );
}

export function MonthlyRevenueChart({
  data,
  currency = agency.currency,
  title = "Ingresos por mes",
}: {
  data: { label: string; total: number }[];
  currency?: string;
  title?: string;
}) {
  return (
    <Card>
      <h2 className="mb-4 font-display text-sm font-semibold text-ink">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-line" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={70}
              tickFormatter={(v) => formatMoney(v, currency)}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="total" fill={agency.colors.primary} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function BreakdownChart({
  title,
  data,
  currency = agency.currency,
}: {
  title: string;
  data: { name: string; total: number }[];
  currency?: string;
}) {
  return (
    <Card>
      <h2 className="mb-4 font-display text-sm font-semibold text-ink">{title}</h2>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-inkmuted">Sin datos todavía.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-line" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMoney(v, currency)}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="total" fill={agency.colors.accent} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
