'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/Field';

type FilterDef =
  | { name: string; type: 'search'; placeholder: string }
  | { name: string; type: 'select'; label: string; options: { value: string; label: string }[] }
  | { name: string; type: 'date'; label: string };

/** Filtros sincronizados com a URL (a página do servidor refaz a consulta). */
export function UrlFilters({ filters }: { filters: FilterDef[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get('q') ?? '');

  const update = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value); else next.delete(name);
    next.delete('page');
    start(() => router.replace(`${pathname}?${next}`, { scroll: false }));
  };
  useEffect(() => {
    const t = setTimeout(() => { if ((params.get('q') ?? '') !== q) update('q', q.trim()); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const active = Array.from(params.keys()).filter((k) => k !== 'page').length;

  return (
    <div className="flex flex-col gap-2 border-b border-duna-800/[.07] p-4 lg:flex-row lg:items-center">
      {filters.map((f) => {
        if (f.type === 'search') return (
          <div key={f.name} className="relative flex-1">
            {pending ? <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-muted" /> : <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />}
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={f.placeholder} className="pl-9" aria-label="Buscar" />
          </div>
        );
        if (f.type === 'select') return <Select key={f.name} aria-label={f.label} value={params.get(f.name) ?? ''} onChange={(e) => update(f.name, e.target.value)} placeholder={`${f.label}: todos`} options={f.options} className="lg:w-48" />;
        return (
          <label key={f.name} className="flex items-center gap-2 text-sm text-ink-muted lg:w-auto">
            <span className="shrink-0">{f.label}</span>
            <Input type="date" value={params.get(f.name) ?? ''} onChange={(e) => update(f.name, e.target.value)} className="lg:w-40" />
          </label>
        );
      })}
      {active > 0 && (
        <button onClick={() => { setQ(''); start(() => router.replace(pathname, { scroll: false })); }} className="inline-flex items-center gap-1 whitespace-nowrap px-2 text-sm font-medium text-lagoa-600 hover:underline">
          <X className="size-4" />Limpar
        </button>
      )}
    </div>
  );
}

export function Pagination({ page, total, perPage }: { page: number; total: number; perPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const go = (p: number) => { const n = new URLSearchParams(params); n.set('page', String(p)); router.push(`${pathname}?${n}`); };
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-ink-muted">
      <span>{total} registros · página {page} de {pages}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => go(page - 1)} className="rounded-full px-3 py-1.5 font-medium ring-1 ring-duna-800/15 disabled:opacity-40">Anterior</button>
        <button disabled={page >= pages} onClick={() => go(page + 1)} className="rounded-full px-3 py-1.5 font-medium ring-1 ring-duna-800/15 disabled:opacity-40">Próxima</button>
      </div>
    </div>
  );
}
