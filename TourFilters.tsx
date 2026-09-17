'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select, Input } from '@/components/ui/Field';
import { cn } from '@/components/ui/cn';

type Opt = { value: string; label: string };

export const DURATION_OPTS: Opt[] = [
  { value: '0-240', label: 'Até 4 horas' }, { value: '241-480', label: 'Meio dia a dia inteiro' }, { value: '481-0', label: 'Mais de 8 horas' },
];
export const PRICE_OPTS: Opt[] = [
  { value: '0-150', label: 'Até R$ 150' }, { value: '150-300', label: 'R$ 150 a R$ 300' }, { value: '300-600', label: 'R$ 300 a R$ 600' }, { value: '600-0', label: 'Acima de R$ 600' },
];
const TYPE_OPTS: Opt[] = [{ value: 'compartilhado', label: 'Compartilhado' }, { value: 'privativo', label: 'Privativo' }];
const AVAIL_OPTS: Opt[] = [{ value: 'com-vagas', label: 'Com vagas' }];

export function TourFilters({ categories, destinations, variant = 'page', basePath = '/passeios' }: {
  categories: Opt[]; destinations: Opt[]; variant?: 'hero' | 'page'; basePath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [more, setMore] = useState(false);
  const [values, setValues] = useState(() => Object.fromEntries(['q', 'destino', 'categoria', 'tipo', 'duracao', 'preco', 'disponibilidade'].map((k) => [k, params.get(k) ?? ''])));
  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const activeCount = Object.values(values).filter(Boolean).length;

  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const qs = new URLSearchParams(Object.entries(values).filter(([, v]) => v));
    start(() => router.push(`${basePath}${qs.size ? `?${qs}` : ''}${variant === 'hero' ? '#lista' : ''}`, { scroll: variant === 'hero' }));
  };
  const clear = () => { setValues({ q: '', destino: '', categoria: '', tipo: '', duracao: '', preco: '', disponibilidade: '' }); start(() => router.push(basePath, { scroll: false })); };

  if (variant === 'hero') {
    return (
      <form onSubmit={apply} role="search" aria-label="Encontrar passeio" className="grid gap-2 rounded-3xl bg-white p-2.5 shadow-lift sm:grid-cols-[1fr_1fr_auto] lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="hidden flex-col px-3 py-1.5 lg:flex">
          <span className="text-xs font-semibold text-ink-muted">Destino</span>
          <select value={values.destino} onChange={(e) => set('destino', e.target.value)} className="bg-transparent py-0.5 text-[15px] font-medium text-ink focus:outline-none">
            <option value="">Todos os destinos</option>
            {destinations.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col rounded-2xl px-3 py-1.5 sm:border-l-0 lg:border-l lg:border-duna-800/10 lg:rounded-none">
          <span className="text-xs font-semibold text-ink-muted">Tipo de passeio</span>
          <select value={values.categoria} onChange={(e) => set('categoria', e.target.value)} className="bg-transparent py-0.5 text-[15px] font-medium text-ink focus:outline-none">
            <option value="">Todos</option>
            {categories.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col rounded-2xl px-3 py-1.5 sm:border-l sm:border-duna-800/10 sm:rounded-none">
          <span className="text-xs font-semibold text-ink-muted">Disponibilidade</span>
          <select value={values.disponibilidade} onChange={(e) => set('disponibilidade', e.target.value)} className="bg-transparent py-0.5 text-[15px] font-medium text-ink focus:outline-none">
            <option value="">Qualquer</option>
            {AVAIL_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <Button type="submit" variant="primary" size="lg" loading={pending} className="rounded-2xl"><Search className="size-5" />Buscar passeios</Button>
      </form>
    );
  }

  return (
    <form onSubmit={apply} role="search" aria-label="Filtrar passeios" className="rounded-3xl bg-white p-4 ring-1 ring-duna-800/[.08] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
          <Input value={values.q} onChange={(e) => set('q', e.target.value)} placeholder="Buscar por nome ou lugar" className="pl-11" aria-label="Buscar" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setMore((m) => !m)} aria-expanded={more} className="flex-1 sm:flex-none">
            <SlidersHorizontal className="size-4" />Filtros{activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-sol-500 text-xs text-duna-950">{activeCount}</span>}
          </Button>
          <Button type="submit" loading={pending} className="flex-1 sm:flex-none">Aplicar</Button>
        </div>
      </div>
      <div className={cn('grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-6', !more && 'hidden')}>
        <Select aria-label="Destino" value={values.destino} onChange={(e) => set('destino', e.target.value)} placeholder="Destino" options={destinations} />
        <Select aria-label="Categoria" value={values.categoria} onChange={(e) => set('categoria', e.target.value)} placeholder="Categoria" options={categories} />
        <Select aria-label="Tipo" value={values.tipo} onChange={(e) => set('tipo', e.target.value)} placeholder="Compartilhado ou privativo" options={TYPE_OPTS} />
        <Select aria-label="Duração" value={values.duracao} onChange={(e) => set('duracao', e.target.value)} placeholder="Duração" options={DURATION_OPTS} />
        <Select aria-label="Faixa de preço" value={values.preco} onChange={(e) => set('preco', e.target.value)} placeholder="Faixa de preço" options={PRICE_OPTS} />
        <Select aria-label="Disponibilidade" value={values.disponibilidade} onChange={(e) => set('disponibilidade', e.target.value)} placeholder="Disponibilidade" options={AVAIL_OPTS} />
      </div>
      {activeCount > 0 && (
        <button type="button" onClick={clear} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-lagoa-600 hover:underline"><X className="size-4" />Limpar filtros</button>
      )}
    </form>
  );
}
