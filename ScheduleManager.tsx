'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, CopyPlus, Pencil, Trash2 } from 'lucide-react';
import { bulkCreateSchedules, deleteSchedule, saveSchedule } from '@/actions/tours';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { Table, Td, Th } from '@/components/ui/Table';
import { cn } from '@/components/ui/cn';
import { SCHEDULE_STATUS } from '@/lib/tour-status';
import { capFirst, fmtDateLong, fmtTime, todayISO, addDaysISO } from '@/lib/format';
import type { ScheduleRow } from '@/lib/types';
import { useAction } from './useAction';

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ScheduleManager({ tourId, schedules, defaultCapacity, defaultTimes, canEdit, threshold }: {
  tourId: string; schedules: ScheduleRow[]; defaultCapacity: number; defaultTimes: string[]; canEdit: boolean; threshold: number;
}) {
  const [edit, setEdit] = useState<ScheduleRow | 'new' | null>(null);
  const [bulk, setBulk] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [bulkForm, setBulkForm] = useState({ from: todayISO(), to: addDaysISO(todayISO(), 30), weekdays: [0, 1, 2, 3, 4, 5, 6], times: defaultTimes.join(', ') || '08:00', capacity: String(defaultCapacity || 10) });
  const [showPast, setShowPast] = useState(false);
  const { pending, errors, exec } = useAction();
  const today = todayISO();
  const list = schedules.filter((s) => showPast || s.date >= today);
  const totals = schedules.filter((s) => s.date >= today && s.status === 'aberto')
    .reduce((a, s) => ({ cap: a.cap + s.capacity, booked: a.booked + s.booked + s.manual_occupied, avail: a.avail + s.available }), { cap: 0, booked: 0, avail: 0 });

  const open = (s: ScheduleRow | 'new') => {
    setForm(s === 'new'
      ? { date: today, start_time: defaultTimes[0] ?? '', capacity: String(defaultCapacity || 10), manual_occupied: '0', status: 'aberto', notes: '' }
      : { date: s.date, start_time: fmtTime(s.start_time), capacity: String(s.capacity), manual_occupied: String(s.manual_occupied), status: s.status, notes: s.notes ?? '' });
    setEdit(s);
  };

  return (
    <Card id="horarios" className="scroll-mt-24">
      <CardHeader title="Datas, horários e vagas" description={`Vagas disponíveis = capacidade − ocupadas manualmente − reservas confirmadas. Próximas saídas: ${totals.avail} livres de ${totals.cap}.`}
        actions={canEdit && <>
          <Button size="sm" variant="secondary" onClick={() => setBulk(true)}><CopyPlus className="size-4" />Criar em lote</Button>
          <Button size="sm" onClick={() => open('new')}><CalendarPlus className="size-4" />Novo horário</Button>
        </>} />
      <div className="px-5 pt-3"><label className="inline-flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} className="rounded" />Mostrar datas passadas</label></div>
      {list.length === 0 ? (
        <EmptyState title="Nenhum horário cadastrado." description="Sem horários, o site pede ao cliente a data desejada e a equipe confirma a disponibilidade." />
      ) : (
        <Table className="mt-2">
          <thead><tr><Th>Data</Th><Th>Horário</Th><Th>Ocupação</Th><Th className="hidden sm:table-cell">Pendentes</Th><Th>Status</Th>{canEdit && <Th><span className="sr-only">Ações</span></Th>}</tr></thead>
          <tbody>
            {list.map((s) => {
              const used = s.booked + s.manual_occupied;
              const pct = s.capacity ? Math.min(100, (used / s.capacity) * 100) : 0;
              const alert = s.available === 0 ? 'Lotado' : s.capacity && s.available / s.capacity <= threshold ? 'Poucas vagas' : null;
              return (
                <tr key={s.id} className={cn(s.date < today && 'opacity-60')}>
                  <Td className="whitespace-nowrap font-medium">{capFirst(fmtDateLong(s.date))}</Td>
                  <Td>{fmtTime(s.start_time) || '—'}</Td>
                  <Td className="min-w-[10rem]">
                    <div className="flex items-center justify-between text-xs"><span>{used}/{s.capacity} ocupadas</span><span className="font-semibold">{s.available} livres</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn('h-full rounded-full', pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-sol-500' : 'bg-lagoa-500')} style={{ width: `${pct}%` }} /></div>
                    {alert && <span className="mt-1 inline-block text-xs font-semibold text-sol-700">{alert}</span>}
                  </Td>
                  <Td className="hidden sm:table-cell">{s.pending || '—'}</Td>
                  <Td><Badge tone={SCHEDULE_STATUS[s.status].tone}>{SCHEDULE_STATUS[s.status].label}</Badge></Td>
                  {canEdit && (
                    <Td className="whitespace-nowrap text-right">
                      <Link href={`/admin/reservas?horario=${s.id}`} className="mr-1 text-xs font-semibold text-lagoa-600 hover:underline">Reservas</Link>
                      <Button size="sm" variant="ghost" onClick={() => open(s)} aria-label="Editar horário"><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => exec(() => deleteSchedule(tourId, s.id))} aria-label="Excluir horário"><Trash2 className="size-4 text-red-600" /></Button>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === 'new' ? 'Novo horário' : 'Editar horário'}
        footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => saveSchedule(tourId, edit === 'new' ? null : (edit as ScheduleRow).id, form), { onSuccess: () => setEdit(null) })}>Salvar</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data" htmlFor="s-date" error={errors.date} required><Input id="s-date" type="date" value={form.date ?? ''} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Horário" htmlFor="s-time"><Input id="s-time" type="time" value={form.start_time ?? ''} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></Field>
          <Field label="Capacidade total" htmlFor="s-cap" error={errors.capacity} required><Input id="s-cap" type="number" min={0} value={form.capacity ?? ''} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
          <Field label="Vagas ocupadas (fora do sistema)" htmlFor="s-occ" error={errors.manual_occupied}><Input id="s-occ" type="number" min={0} value={form.manual_occupied ?? ''} onChange={(e) => setForm({ ...form, manual_occupied: e.target.value })} /></Field>
          <Field label="Status" htmlFor="s-status" className="sm:col-span-2">
            <Select id="s-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={Object.entries(SCHEDULE_STATUS).map(([k, m]) => ({ value: k, label: m.label }))} />
          </Field>
          <Field label="Observações" htmlFor="s-notes" className="sm:col-span-2"><Textarea id="s-notes" rows={2} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
      </Modal>

      <Modal open={bulk} onClose={() => setBulk(false)} title="Criar horários em lote" description="Gera um horário para cada dia e hora escolhidos. Datas já existentes são ignoradas."
        footer={<><Button variant="ghost" onClick={() => setBulk(false)}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => bulkCreateSchedules(tourId, { ...bulkForm, times: bulkForm.times.split(/[,\s]+/).filter(Boolean) }), { onSuccess: () => setBulk(false) })}>Criar horários</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="De" htmlFor="b-from"><Input id="b-from" type="date" value={bulkForm.from} onChange={(e) => setBulkForm({ ...bulkForm, from: e.target.value })} /></Field>
          <Field label="Até" htmlFor="b-to" error={errors.to}><Input id="b-to" type="date" value={bulkForm.to} onChange={(e) => setBulkForm({ ...bulkForm, to: e.target.value })} /></Field>
          <Field label="Dias da semana" error={errors.weekdays} className="sm:col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {WEEK.map((d, i) => {
                const on = bulkForm.weekdays.includes(i);
                return <button key={d} type="button" aria-pressed={on} onClick={() => setBulkForm({ ...bulkForm, weekdays: on ? bulkForm.weekdays.filter((x) => x !== i) : [...bulkForm.weekdays, i] })}
                  className={cn('rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset', on ? 'bg-duna-800 text-white ring-duna-800' : 'ring-duna-800/15')}>{d}</button>;
              })}
            </div>
          </Field>
          <Field label="Horários" htmlFor="b-times" help="Separados por vírgula" error={errors.times ?? errors['times.0']}><Input id="b-times" value={bulkForm.times} onChange={(e) => setBulkForm({ ...bulkForm, times: e.target.value })} /></Field>
          <Field label="Capacidade por horário" htmlFor="b-cap" error={errors.capacity}><Input id="b-cap" type="number" min={1} value={bulkForm.capacity} onChange={(e) => setBulkForm({ ...bulkForm, capacity: e.target.value })} /></Field>
        </div>
      </Modal>
    </Card>
  );
}
