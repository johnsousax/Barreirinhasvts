'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '@/components/ui/States';

const COLORS = ['#1486C9', '#F59E1B', '#0E3A6E', '#22A06B', '#7C8BA1', '#E5484D', '#6BC3EE'];
const tick = { fill: '#6B7F99', fontSize: 12 };
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function Empty() { return <EmptyState title="Sem dados no período." className="py-10" />; }

export function TrendChart({ data, money }: { data: { label: string; value: number }[]; money?: boolean }) {
  if (!data.some((d) => d.value)) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1486C9" stopOpacity={0.28} /><stop offset="100%" stopColor="#1486C9" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="#EEF1F5" />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
        <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(v) => (money ? `R$ ${v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : v}` : v)} width={money ? 64 : 40} />
        <Tooltip formatter={(v) => (money ? brl(Number(v)) : v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(6,26,51,.12)' }} />
        <Area type="linear" dataKey="value" name={money ? 'Receita' : 'Reservas'} stroke="#1486C9" strokeWidth={2.5} fill="url(#g1)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({ data, money, horizontal }: { data: { label: string; value: number }[]; money?: boolean; horizontal?: boolean }) {
  if (!data.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={horizontal ? Math.max(180, data.length * 42) : 260}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 6, right: 12, left: horizontal ? 8 : -12, bottom: 0 }}>
        <CartesianGrid horizontal={!horizontal} vertical={!!horizontal} stroke="#EEF1F5" />
        {horizontal
          ? <><XAxis type="number" tick={tick} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={(v) => (money ? `${Math.round(v / 1000)}k` : v)} /><YAxis type="category" dataKey="label" tick={tick} axisLine={false} tickLine={false} width={130} /></>
          : <><XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} /><YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} width={money ? 64 : 40} tickFormatter={(v) => (money ? `R$ ${v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : v}` : v)} /></>}
        <Tooltip formatter={(v) => (money ? brl(Number(v)) : v)} cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(6,26,51,.12)' }} />
        <Bar dataKey="value" name={money ? 'Receita' : 'Total'} fill="#1486C9" radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return <Empty />;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={82} paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(6,26,51,.12)' }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.label}</span>
            <span className="font-semibold">{d.value} <span className="font-normal text-ink-muted">({Math.round((d.value / total) * 100)}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
