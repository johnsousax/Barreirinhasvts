'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, UserRound } from 'lucide-react';
import {
  addPassenger, addPayment, deletePassenger, deletePayment, getSchedulesForTour, saveBooking, searchCustomers, setBookingStatus,
} from '@/actions/bookings';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Drawer, Modal } from '@/components/ui/Modal';
import { Table, Td, Th } from '@/components/ui/Table';
import { BOOKING_STATUS } from '@/lib/tour-status';
import { PAYMENT_METHODS, PAYMENT_STATUS, SOURCES } from '@/lib/constants';
import { brl, fmtDate, fmtDateTime, fmtTime, todayISO } from '@/lib/format';
import type { Booking, BookingStatus } from '@/lib/types';
import { useAction } from './useAction';

type Opt = { value: string; label: string };
type Slot = { id: string; date: string; start_time: string | null; capacity: number; available: number; status: string };
export type BookingPrefill = Partial<{ customer_id: string; customer_label: string; customer_name: string; customer_phone: string; customer_email: string; tour_id: string; date: string; people: number; lead_id: string; notes: string; source: string }>;

export function BookingEditor({ open, onClose, booking, tours, prefill }: { open: boolean; onClose: () => void; booking?: Booking | null; tours: (Opt & { price: number | null })[]; prefill?: BookingPrefill }) {
  const { pending, errors, exec } = useAction();
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const [customerLabel, setCustomerLabel] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; phone: string | null; email: string | null }[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const b = booking;
    setV({
      customer_id: b?.customer_id ?? prefill?.customer_id ?? '', customer_name: prefill?.customer_name ?? '', customer_phone: prefill?.customer_phone ?? '', customer_email: prefill?.customer_email ?? '',
      tour_id: b?.tour_id ?? prefill?.tour_id ?? '', schedule_id: b?.schedule_id ?? '', date: b?.date ?? prefill?.date ?? todayISO(), start_time: fmtTime(b?.start_time),
      people: String(b?.people ?? prefill?.people ?? 1), unit_price: b?.unit_price != null ? String(b.unit_price) : '', total_amount: b?.total_amount != null ? String(b.total_amount) : '',
      status: b?.status ?? 'confirmada', source: b?.source ?? prefill?.source ?? 'whatsapp', notes: b?.notes ?? prefill?.notes ?? '', lead_id: b?.lead_id ?? prefill?.lead_id ?? '',
    });
    setCustomerLabel(b?.customer?.name ?? prefill?.customer_label ?? '');
  }, [open, booking, prefill]);

  useEffect(() => {
    if (!open || !v.tour_id) { setSlots([]); return; }
    getSchedulesForTour(v.tour_id).then(setSlots).catch(() => setSlots([]));
  }, [open, v.tour_id]);

  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));
  const onSearch = (q: string) => {
    setCustomerLabel(q);
    set('customer_id', '');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => searchCustomers(q).then(setResults).catch(() => setResults([])), 250);
  };
  const pickTour = (id: string) => {
    const t = tours.find((x) => x.value === id);
    setV((s) => ({ ...s, tour_id: id, schedule_id: '', unit_price: s.unit_price || (t?.price != null ? String(t.price) : '') }));
  };
  const pickSlot = (id: string) => {
    const s = slots.find((x) => x.id === id);
    setV((p) => ({ ...p, schedule_id: id, ...(s ? { date: s.date, start_time: fmtTime(s.start_time) } : {}) }));
  };
  const total = v.total_amount || (v.unit_price && v.people ? String(Number(v.unit_price.replace(',', '.')) * Number(v.people)) : '');

  return (
    <Drawer open={open} onClose={onClose} width="lg" title={booking ? `Editar reserva ${booking.code}` : 'Nova reserva'}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => saveBooking(booking?.id ?? null, v), { onSuccess: (d) => { onClose(); if (!booking && d) router.push(`/admin/reservas/${d.id}`); } })}>Salvar reserva</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente" htmlFor="b-cust" error={errors.customer_name} required className="relative sm:col-span-2">
          <Input id="b-cust" value={customerLabel} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar por nome, telefone ou e-mail" autoComplete="off" />
          {results.length > 0 && !v.customer_id && (
            <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-duna-800/10">
              {results.map((c) => (
                <li key={c.id}><button type="button" onClick={() => { set('customer_id', c.id); setCustomerLabel(c.name); setResults([]); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-lagoa-50">
                  <UserRound className="size-4 text-ink-muted" /><span className="font-medium">{c.name}</span><span className="text-ink-muted">{c.phone ?? c.email}</span>
                </button></li>
              ))}
            </ul>
          )}
        </Field>
        {!v.customer_id && (
          <div className="grid gap-3 rounded-2xl bg-white p-3 ring-1 ring-duna-800/10 sm:col-span-2 sm:grid-cols-3">
            <p className="text-xs text-ink-muted sm:col-span-3">Cliente novo? Preencha abaixo e ele será cadastrado.</p>
            <Input aria-label="Nome" placeholder="Nome" value={v.customer_name ?? ''} onChange={(e) => set('customer_name', e.target.value)} />
            <Input aria-label="Telefone" placeholder="WhatsApp" value={v.customer_phone ?? ''} onChange={(e) => set('customer_phone', e.target.value)} />
            <Input aria-label="E-mail" placeholder="E-mail" value={v.customer_email ?? ''} onChange={(e) => set('customer_email', e.target.value)} />
          </div>
        )}
        <Field label="Passeio" htmlFor="b-tour" error={errors.tour_id} required className="sm:col-span-2"><Select id="b-tour" value={v.tour_id ?? ''} onChange={(e) => pickTour(e.target.value)} placeholder="Selecione" options={tours} /></Field>
        {slots.length > 0 && (
          <Field label="Horário cadastrado" htmlFor="b-slot" help="Vincular a um horário faz a reserva ocupar vagas quando confirmada." className="sm:col-span-2">
            <Select id="b-slot" value={v.schedule_id ?? ''} onChange={(e) => pickSlot(e.target.value)} placeholder="Sem vínculo (data livre)"
              options={slots.map((s) => ({ value: s.id, label: `${fmtDate(s.date)} ${fmtTime(s.start_time)} — ${s.available}/${s.capacity} vagas${s.status !== 'aberto' ? ' (fechado)' : ''}` }))} />
          </Field>
        )}
        <Field label="Data" htmlFor="b-date" error={errors.date} required><Input id="b-date" type="date" value={v.date ?? ''} disabled={!!v.schedule_id} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Horário" htmlFor="b-time"><Input id="b-time" type="time" value={v.start_time ?? ''} disabled={!!v.schedule_id} onChange={(e) => set('start_time', e.target.value)} /></Field>
        <Field label="Pessoas" htmlFor="b-people" error={errors.people} required><Input id="b-people" type="number" min={1} value={v.people ?? ''} onChange={(e) => set('people', e.target.value)} /></Field>
        <Field label="Status" htmlFor="b-status"><Select id="b-status" value={v.status} onChange={(e) => set('status', e.target.value)} options={Object.entries(BOOKING_STATUS).map(([k, m]) => ({ value: k, label: m.label }))} /></Field>
        <Field label="Valor por pessoa (R$)" htmlFor="b-unit"><Input id="b-unit" inputMode="decimal" value={v.unit_price ?? ''} onChange={(e) => set('unit_price', e.target.value)} /></Field>
        <Field label="Valor total (R$)" htmlFor="b-total" help={!v.total_amount && total ? `Calculado: ${brl(Number(total))}` : 'Vazio = pessoas × valor'}><Input id="b-total" inputMode="decimal" value={v.total_amount ?? ''} onChange={(e) => set('total_amount', e.target.value)} /></Field>
        <Field label="Origem" htmlFor="b-source"><Select id="b-source" value={v.source} onChange={(e) => set('source', e.target.value)} options={SOURCES} /></Field>
        <Field label="Observações" htmlFor="b-notes" className="sm:col-span-2"><Textarea id="b-notes" rows={3} value={v.notes ?? ''} onChange={(e) => set('notes', e.target.value)} /></Field>
      </div>
    </Drawer>
  );
}

export function NewBookingButton({ tours, prefill, label = 'Nova reserva', variant = 'primary' }: { tours: (Opt & { price: number | null })[]; prefill?: BookingPrefill; label?: string; variant?: 'primary' | 'secondary' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}><Plus className="size-4" />{label}</Button>
      <BookingEditor open={open} onClose={() => setOpen(false)} tours={tours} prefill={prefill} />
    </>
  );
}

export function EditBookingButton({ booking, tours }: { booking: Booking; tours: (Opt & { price: number | null })[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Editar</Button>
      <BookingEditor open={open} onClose={() => setOpen(false)} booking={booking} tours={tours} />
    </>
  );
}

export function BookingStatusControl({ id, status }: { id: string; status: BookingStatus }) {
  const [target, setTarget] = useState<BookingStatus | null>(null);
  const [note, setNote] = useState('');
  const { pending, exec } = useAction();
  const quick: BookingStatus[] = ['confirmada', 'aguardando_pagamento', 'pago', 'concluida', 'nao_compareceu', 'cancelada'];
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {quick.filter((s) => s !== status).map((s) => (
          <Button key={s} size="sm" variant={s === 'cancelada' ? 'ghost' : 'secondary'} className={s === 'cancelada' ? 'text-red-600' : ''} onClick={() => { setNote(''); setTarget(s); }}>
            {({ confirmada: 'Confirmar', aguardando_pagamento: 'Aguardar pagamento', pago: 'Marcar como pago', concluida: 'Concluir', nao_compareceu: 'Não compareceu', cancelada: 'Cancelar' } as Record<string, string>)[s]}
          </Button>
        ))}
      </div>
      <Modal open={!!target} onClose={() => setTarget(null)} size="sm" title={`Alterar para “${target ? BOOKING_STATUS[target].label : ''}”?`}
        description={target === 'cancelada' ? 'As vagas voltam a ficar disponíveis no site.' : target === 'confirmada' ? 'A reserva passa a ocupar vagas do horário.' : undefined}
        footer={<><Button variant="ghost" onClick={() => setTarget(null)}>Voltar</Button><Button variant={target === 'cancelada' ? 'danger' : 'primary'} loading={pending} onClick={() => exec(() => setBookingStatus(id, target!, note), { onSuccess: () => setTarget(null) })}>Confirmar</Button></>}>
        <Field label="Observação (opcional)" htmlFor="st-note"><Textarea id="st-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </Modal>
    </>
  );
}

type Payment = { id: string; amount: number; method: string; status: string; paid_at: string; notes: string | null };
export function PaymentsPanel({ bookingId, payments, total }: { bookingId: string; payments: Payment[]; total: number | null }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ amount: '', method: 'pix', status: 'pago', paid_at: '', notes: '' });
  const { pending, errors, exec } = useAction();
  const paid = payments.filter((p) => p.status === 'pago').reduce((a, p) => a + Number(p.amount), 0);
  return (
    <Card>
      <CardHeader title="Pagamentos" description={total != null ? `Pago ${brl(paid)} de ${brl(total)} · saldo ${brl(Math.max(0, total - paid))}` : `Pago ${brl(paid)}`}
        actions={<Button size="sm" variant="secondary" onClick={() => { setV({ amount: total != null ? String(Math.max(0, total - paid)) : '', method: 'pix', status: 'pago', paid_at: '', notes: '' }); setOpen(true); }}><Plus className="size-4" />Registrar</Button>} />
      {payments.length === 0 ? <p className="px-5 py-6 text-sm text-ink-muted">Nenhum pagamento registrado.</p> : (
        <Table className="mt-3"><thead><tr><Th>Data</Th><Th>Valor</Th><Th>Forma</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{payments.map((p) => (
            <tr key={p.id}>
              <Td>{fmtDateTime(p.paid_at)}</Td><Td className="font-semibold">{brl(p.amount)}</Td>
              <Td>{PAYMENT_METHODS.find((m) => m.value === p.method)?.label}</Td>
              <Td><Badge tone={PAYMENT_STATUS[p.status]?.tone}>{PAYMENT_STATUS[p.status]?.label}</Badge></Td>
              <Td><Button size="sm" variant="ghost" onClick={() => exec(() => deletePayment(bookingId, p.id))} aria-label="Remover pagamento"><Trash2 className="size-4 text-red-600" /></Button></Td>
            </tr>
          ))}</tbody>
        </Table>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar pagamento"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => addPayment(bookingId, v), { onSuccess: () => setOpen(false) })}>Salvar</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor (R$)" htmlFor="p-amount" error={errors.amount} required><Input id="p-amount" inputMode="decimal" value={v.amount} onChange={(e) => setV({ ...v, amount: e.target.value })} /></Field>
          <Field label="Forma" htmlFor="p-method"><Select id="p-method" value={v.method} onChange={(e) => setV({ ...v, method: e.target.value })} options={PAYMENT_METHODS} /></Field>
          <Field label="Status" htmlFor="p-status"><Select id="p-status" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })} options={Object.entries(PAYMENT_STATUS).map(([k, m]) => ({ value: k, label: m.label }))} /></Field>
          <Field label="Data" htmlFor="p-date" help="Vazio = agora"><Input id="p-date" type="datetime-local" value={v.paid_at} onChange={(e) => setV({ ...v, paid_at: e.target.value })} /></Field>
          <Field label="Observação" htmlFor="p-notes" className="sm:col-span-2"><Input id="p-notes" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
        </div>
      </Modal>
    </Card>
  );
}

type Passenger = { id: string; name: string; document: string | null; birth_date: string | null; phone: string | null };
export function PassengersPanel({ bookingId, passengers, people }: { bookingId: string; passengers: Passenger[]; people: number }) {
  const [v, setV] = useState({ name: '', document: '', birth_date: '', phone: '' });
  const { pending, errors, exec } = useAction();
  return (
    <Card>
      <CardHeader title="Passageiros" description={`${passengers.length} de ${people} informados`} />
      <ul className="divide-y divide-duna-800/[.06] px-5 pt-2">
        {passengers.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span><span className="font-medium">{p.name}</span><span className="text-ink-muted">{[p.document, p.birth_date && fmtDate(p.birth_date), p.phone].filter(Boolean).map((x) => ` · ${x}`).join('')}</span></span>
            <Button size="sm" variant="ghost" onClick={() => exec(() => deletePassenger(bookingId, p.id))} aria-label={`Remover ${p.name}`}><Trash2 className="size-4 text-red-600" /></Button>
          </li>
        ))}
      </ul>
      {passengers.length < people && (
        <form onSubmit={(e) => { e.preventDefault(); exec(() => addPassenger(bookingId, v), { onSuccess: () => setV({ name: '', document: '', birth_date: '', phone: '' }) }); }}
          className="grid gap-2 border-t border-duna-800/[.07] p-4 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
          <Input aria-label="Nome do passageiro" placeholder="Nome" value={v.name} invalid={!!errors.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
          <Input aria-label="Documento" placeholder="Documento" value={v.document} onChange={(e) => setV({ ...v, document: e.target.value })} />
          <Input aria-label="Nascimento" type="date" value={v.birth_date} onChange={(e) => setV({ ...v, birth_date: e.target.value })} />
          <Button type="submit" variant="secondary" loading={pending}><Plus className="size-4" />Adicionar</Button>
        </form>
      )}
    </Card>
  );
}
