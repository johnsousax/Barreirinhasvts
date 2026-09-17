'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { cn } from '@/components/ui/cn';
import { capFirst, fmtDate, fmtTime, todayISO } from '@/lib/format';

type S = { id: string; tour_id: string; date: string; start_time: string | null; capacity: number; available: number; booked: number; pending: number; status: string };
const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarView({ month, tourId, tours, schedules, threshold }: { month: string; tourId: string; tours: { value: string; label: string }[]; schedules: S[]; threshold: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const names = new Map(tours.map((t) => [t.value, t.label]));
  const first = new Date(`${month}-01T12:00:00`);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const offset = first.getDay();
  const today = todayISO();
  const nav = (delta: number) => {
    const d = new Date(first); d.setMonth(d.getMonth() + delta);
    const p = new URLSearchParams({ mes: d.toISOString().slice(0, 7), ...(tourId ? { passeio: tourId } : {}) });
    router.push(`/admin/calendario?${p}`);
  };
  const byDay = (iso: string) => schedules.filter((s) => s.date === iso);
  const tone = (s: S) => s.status !== 'aberto' ? 'bg-slate-100 text-slate-500' : s.available === 0 ? 'bg-red-50 text-red-700' : s.capacity && s.available / s.capacity <= threshold ? 'bg-sol-50 text-sol-700' : 'bg-lagoa-50 text-lagoa-700';
  const dayList = selected ? byDay(selected) : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-duna-800/[.07] p-4">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => nav(-1)} aria-label="Mês anterior"><ChevronLeft className="size-4" /></Button>
            <h2 className="min-w-40 text-center font-display text-lg font-semibold">{capFirst(fmtDate(`${month}-01`, { month: 'long', year: 'numeric' }))}</h2>
            <Button size="sm" variant="ghost" onClick={() => nav(1)} aria-label="Próximo mês"><ChevronRight className="size-4" /></Button>
          </div>
          <Select aria-label="Filtrar passeio" value={tourId} placeholder="Todos os passeios" options={tours} className="sm:w-64"
            onChange={(e) => router.push(`/admin/calendario?${new URLSearchParams({ mes: month, ...(e.target.value ? { passeio: e.target.value } : {}) })}`)} />
        </div>
        <div className="grid grid-cols-7 border-b border-duna-800/[.07] bg-slate-50 text-center text-xs font-semibold text-ink-muted">
          {WEEK.map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} className="min-h-20 border-b border-r border-duna-800/[.05] bg-slate-50/50 sm:min-h-28" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const iso = `${month}-${String(i + 1).padStart(2, '0')}`;
            const list = byDay(iso);
            return (
              <button key={iso} onClick={() => setSelected(iso)} aria-label={`${fmtDate(iso)}: ${list.length} saídas`}
                className={cn('min-h-20 border-b border-r border-duna-800/[.05] p-1.5 text-left align-top transition-colors hover:bg-lagoa-50/40 sm:min-h-28', selected === iso && 'bg-lagoa-50/70 ring-2 ring-inset ring-lagoa-500')}>
                <span className={cn('grid size-6 place-items-center rounded-full text-xs font-semibold', iso === today ? 'bg-sol-500 text-duna-950' : 'text-ink-soft')}>{i + 1}</span>
                <span className="mt-1 hidden space-y-0.5 sm:block">
                  {list.slice(0, 3).map((s) => (
                    <span key={s.id} className={cn('block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium', tone(s))}>
                      {fmtTime(s.start_time)} {tourId ? `${s.available} vagas` : names.get(s.tour_id)}
                    </span>
                  ))}
                  {list.length > 3 && <span className="block px-1.5 text-[11px] text-ink-muted">+{list.length - 3}</span>}
                </span>
                {list.length > 0 && <span className="mt-1 flex gap-0.5 sm:hidden">{list.slice(0, 4).map((s) => <span key={s.id} className={cn('size-1.5 rounded-full', tone(s).split(' ')[0].replace('-50', '-500').replace('slate-100', 'slate-400'))} />)}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 p-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-lagoa-500" />Com vagas</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-sol-500" />Poucas vagas</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-500" />Lotado</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-slate-400" />Fechado/cancelado</span>
        </div>
      </Card>

      <Card className="h-fit p-5">
        {!selected ? <p className="text-sm text-ink-muted">Selecione um dia para ver as saídas.</p> : (
          <>
            <h3 className="font-display text-lg font-semibold">{capFirst(fmtDate(selected, { weekday: 'long', day: '2-digit', month: 'long' }))}</h3>
            {dayList.length === 0 ? <p className="mt-3 text-sm text-ink-muted">Nenhuma saída cadastrada.</p> : (
              <ul className="mt-4 space-y-3">
                {dayList.map((s) => (
                  <li key={s.id} className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-semibold">{fmtTime(s.start_time) || 'Horário livre'} · {names.get(s.tour_id)}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{s.capacity - s.available}/{s.capacity} ocupadas · <span className="font-semibold">{s.available} livres</span>{s.pending ? ` · ${s.pending} pendentes` : ''}</p>
                    <div className="mt-2 flex gap-3 text-sm font-semibold">
                      <Link href={`/admin/reservas?horario=${s.id}`} className="text-lagoa-600 hover:underline">Reservas</Link>
                      <Link href={`/admin/passeios/${s.tour_id}#horarios`} className="text-lagoa-600 hover:underline">Editar vagas</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
