'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, GripVertical, Plus, Search, Ticket, Trash2, Users } from 'lucide-react';
import { addLeadNote, deleteLead, getLeadHistory, moveLead, saveLead } from '@/actions/leads';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Drawer } from '@/components/ui/Modal';
import { WhatsAppIcon } from '@/components/ui/icons';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/components/ui/cn';
import { LEAD_STAGES } from '@/lib/tour-status';
import { SOURCES, sourceLabel } from '@/lib/constants';
import { fmtDate, fmtDateTime, formatPhone, timeAgo } from '@/lib/format';
import { whatsappUrl } from '@/lib/whatsapp';
import type { Lead, LeadStage } from '@/lib/types';
import { BookingEditor } from './Bookings';
import { useAction } from './useAction';

type Opt = { value: string; label: string };
type History = Awaited<ReturnType<typeof getLeadHistory>>;

export function LeadsBoard({ leads: initial, tours }: { leads: Lead[]; tours: (Opt & { price: number | null })[] }) {
  const [leads, setLeads] = useState(initial);
  const [q, setQ] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);
  const [editing, setEditing] = useState<Lead | 'new' | null>(null);
  const [booking, setBooking] = useState<Lead | null>(null);
  const [v, setV] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<History>([]);
  const [note, setNote] = useState('');
  const { pending, errors, exec } = useAction();
  const toast = useToast();
  const router = useRouter();
  useEffect(() => setLeads(initial), [initial]);

  const filtered = useMemo(() => leads.filter((l) => !q || `${l.name} ${l.phone ?? ''} ${l.interest ?? ''}`.toLowerCase().includes(q.toLowerCase())), [leads, q]);

  const move = async (id: string, stage: LeadStage) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)));
    const res = await moveLead(id, stage, Date.now() / 1000);
    if (!res.ok) { setLeads(prev); toast.error(res.error); } else router.refresh();
  };

  const open = (l: Lead | 'new') => {
    setV(l === 'new'
      ? { name: '', phone: '', whatsapp: '', email: '', interest: '', tour_id: '', desired_date: '', people: '', notes: '', source: 'whatsapp', stage: 'novo', lost_reason: '' }
      : { name: l.name, phone: l.phone ?? '', whatsapp: l.whatsapp ?? '', email: l.email ?? '', interest: l.interest ?? '', tour_id: l.tour_id ?? '', desired_date: l.desired_date ?? '', people: l.people ? String(l.people) : '', notes: l.notes ?? '', source: l.source, stage: l.stage, lost_reason: l.lost_reason ?? '' });
    setHistory([]);
    setNote('');
    if (l !== 'new') getLeadHistory(l.id).then(setHistory).catch(() => {});
    setEditing(l);
  };
  const current = editing && editing !== 'new' ? editing : null;
  const stageLabel = (k: LeadStage | null) => LEAD_STAGES.find((s) => s.key === k)?.label;

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar lead" className="pl-9" aria-label="Buscar lead" />
        </div>
        <Button className="sm:ml-auto" onClick={() => open('new')}><Plus className="size-4" />Novo lead</Button>
      </div>
      <p className="mb-3 text-xs text-ink-muted sm:hidden">Deslize para ver as etapas. Toque em um lead para mudar a etapa.</p>
      <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {LEAD_STAGES.map((stage) => {
          const items = filtered.filter((l) => l.stage === stage.key);
          return (
            <section key={stage.key} aria-label={stage.label}
              onDragOver={(e) => { e.preventDefault(); setOver(stage.key); }} onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); if (dragging) move(dragging, stage.key); setDragging(null); }}
              className={cn('flex w-[80vw] shrink-0 snap-start flex-col rounded-2xl bg-slate-100/80 p-2 transition-colors sm:w-72', over === stage.key && 'bg-lagoa-100/70 ring-2 ring-lagoa-400')}>
              <header className="flex items-center justify-between px-2 py-1.5">
                <h2 className="text-sm font-semibold">{stage.label}</h2>
                <Badge tone={stage.tone}>{items.length}</Badge>
              </header>
              <ul className="min-h-24 space-y-2">
                {items.map((l) => (
                  <li key={l.id} draggable onDragStart={() => setDragging(l.id)} onDragEnd={() => setDragging(null)}
                    className={cn('group cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-duna-800/[.06] active:cursor-grabbing', dragging === l.id && 'opacity-40')}>
                    <button onClick={() => open(l)} className="block w-full text-left">
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-semibold leading-snug">{l.name}</span>
                        <GripVertical className="size-4 shrink-0 text-slate-300" aria-hidden />
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{l.tour?.name ?? l.interest ?? 'Sem interesse definido'}</span>
                      <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                        {l.desired_date && <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{fmtDate(l.desired_date, { day: '2-digit', month: '2-digit' })}</span>}
                        {l.people && <span className="flex items-center gap-1"><Users className="size-3.5" />{l.people}</span>}
                        <span>{sourceLabel(l.source)}</span>
                        <span className="ml-auto text-ink-muted">{timeAgo(l.updated_at)}</span>
                      </span>
                    </button>
                    <Select aria-label="Mover para etapa" value={l.stage} onChange={(e) => move(l.id, e.target.value as LeadStage)}
                      className="mt-2 h-8 py-1 text-xs lg:hidden" options={LEAD_STAGES.map((s) => ({ value: s.key, label: s.label }))} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Drawer open={!!editing} onClose={() => setEditing(null)} width="lg" title={current ? current.name : 'Novo lead'}
        description={current ? `Criado em ${fmtDateTime(current.created_at)}` : undefined}
        footer={<>
          {current && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => exec(() => deleteLead(current.id), { onSuccess: () => setEditing(null) })}><Trash2 className="size-4" />Excluir</Button>}
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
          <Button loading={pending} onClick={() => exec(() => saveLead(current?.id ?? null, v), { onSuccess: () => setEditing(null) })}>Salvar</Button>
        </>}>
        {current && (
          <div className="mb-5 flex flex-wrap gap-2">
            {(current.whatsapp || current.phone) && <ButtonLink href={whatsappUrl(current.whatsapp || current.phone, `Olá, ${current.name.split(' ')[0]}! Aqui é da Aventure Turismo. Vi seu interesse${current.tour?.name ? ` no passeio ${current.tour.name}` : ''}. Posso te ajudar?`)} variant="whatsapp" size="sm"><WhatsAppIcon className="size-4" />Chamar no WhatsApp</ButtonLink>}
            <Button size="sm" variant="secondary" onClick={() => { setBooking(current); setEditing(null); }}><Ticket className="size-4" />Converter em reserva</Button>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="l-name" error={errors.name} required className="sm:col-span-2"><Input id="l-name" value={v.name ?? ''} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="WhatsApp" htmlFor="l-wa" help={current?.whatsapp ? formatPhone(current.whatsapp) : undefined}><Input id="l-wa" type="tel" value={v.whatsapp ?? ''} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} /></Field>
          <Field label="E-mail" htmlFor="l-email" error={errors.email}><Input id="l-email" type="email" value={v.email ?? ''} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label="Passeio de interesse" htmlFor="l-tour"><Select id="l-tour" value={v.tour_id ?? ''} onChange={(e) => setV({ ...v, tour_id: e.target.value })} placeholder="Nenhum" options={tours} /></Field>
          <Field label="Interesse (texto)" htmlFor="l-int"><Input id="l-int" value={v.interest ?? ''} onChange={(e) => setV({ ...v, interest: e.target.value })} /></Field>
          <Field label="Data desejada" htmlFor="l-date"><Input id="l-date" type="date" value={v.desired_date ?? ''} onChange={(e) => setV({ ...v, desired_date: e.target.value })} /></Field>
          <Field label="Pessoas" htmlFor="l-people"><Input id="l-people" type="number" min={1} value={v.people ?? ''} onChange={(e) => setV({ ...v, people: e.target.value })} /></Field>
          <Field label="Origem" htmlFor="l-source"><Select id="l-source" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} options={SOURCES} /></Field>
          <Field label="Etapa" htmlFor="l-stage"><Select id="l-stage" value={v.stage} onChange={(e) => setV({ ...v, stage: e.target.value })} options={LEAD_STAGES.map((s) => ({ value: s.key, label: s.label }))} /></Field>
          {v.stage === 'perdido' && <Field label="Motivo da perda" htmlFor="l-lost" className="sm:col-span-2"><Input id="l-lost" value={v.lost_reason ?? ''} onChange={(e) => setV({ ...v, lost_reason: e.target.value })} placeholder="Preço, data, desistiu…" /></Field>}
          <Field label="Observações" htmlFor="l-notes" className="sm:col-span-2"><Textarea id="l-notes" rows={3} value={v.notes ?? ''} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
        </div>
        {current && (
          <div className="mt-8">
            <h3 className="font-semibold">Histórico</h3>
            <form onSubmit={(e) => { e.preventDefault(); exec(() => addLeadNote(current.id, note), { onSuccess: () => { setNote(''); getLeadHistory(current.id).then(setHistory); } }); }} className="mt-3 flex gap-2">
              <Input aria-label="Nova anotação" placeholder="Adicionar anotação" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" variant="secondary" loading={pending}>Anotar</Button>
            </form>
            <ol className="mt-4 space-y-3 border-l border-duna-800/10 pl-4 text-sm">
              {history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-lagoa-500 ring-4 ring-areia-50" />
                  <p className="font-medium">{h.note ?? (h.from_stage ? `${stageLabel(h.from_stage)} → ${stageLabel(h.to_stage)}` : `Criado em ${stageLabel(h.to_stage)}`)}</p>
                  <p className="text-xs text-ink-muted">{fmtDateTime(h.created_at)}{h.author ? ` · ${h.author.full_name}` : ''}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Drawer>

      <BookingEditor open={!!booking} onClose={() => setBooking(null)} tours={tours}
        prefill={booking ? {
          customer_id: booking.customer_id ?? undefined, customer_label: booking.name, customer_name: booking.name,
          customer_phone: booking.whatsapp ?? booking.phone ?? '', customer_email: booking.email ?? '', tour_id: booking.tour_id ?? undefined,
          date: booking.desired_date ?? undefined, people: booking.people ?? 1, lead_id: booking.id, notes: booking.notes ?? '', source: booking.source,
        } : undefined} />
    </>
  );
}
