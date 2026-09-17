'use client';
import { useActionState, useMemo, useState } from 'react';
import { CalendarDays, CircleCheck, Minus, Plus } from 'lucide-react';
import { requestBooking } from '@/actions/public';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { WhatsAppIcon } from '@/components/ui/icons';
import { cn } from '@/components/ui/cn';
import { fmtDate, fmtTime, todayISO, addDaysISO } from '@/lib/format';
import { fillTemplate, whatsappUrl } from '@/lib/whatsapp';
import type { ScheduleSlot } from '@/lib/types';

export function BookingForm({ tourId, tourName, slots, bookable, blockedLabel, whatsapp, whatsappMessage, defaultTimes }: {
  tourId: string; tourName: string; slots: ScheduleSlot[]; bookable: boolean; blockedLabel?: string;
  whatsapp: string; whatsappMessage: string; defaultTimes: string[];
}) {
  const [state, action, pending] = useActionState(requestBooking, null);
  const [people, setPeople] = useState(2);
  const hasSlots = slots.length > 0;
  const dates = useMemo(() => Array.from(new Set(slots.map((s) => s.date))), [slots]);
  const [date, setDate] = useState(dates[0] ?? '');
  const [scheduleId, setScheduleId] = useState('');
  const daySlots = slots.filter((s) => s.date === date);
  const selected = slots.find((s) => s.schedule_id === scheduleId);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  const waHref = whatsappUrl(whatsapp, fillTemplate(whatsappMessage, { passeio: tourName }));

  if (state?.ok && state.data) {
    const d = state.data;
    const msg = `Olá! Acabei de solicitar pelo site a reserva ${d.code} do passeio ${d.tour} para ${fmtDate(d.date)} (${people} pessoa(s)). Aguardo a confirmação.`;
    return (
      <div className="rounded-3xl bg-white p-6 text-center ring-1 ring-emerald-600/20" role="status">
        <CircleCheck className="mx-auto size-12 text-emerald-600" />
        <h3 className="mt-3 text-xl font-semibold text-ink">Solicitação enviada</h3>
        <p className="mt-1 text-ink-soft">Código da sua reserva:</p>
        <p className="mt-1 font-display text-3xl font-bold tracking-tight text-duna-800">{d.code}</p>
        <p className="mt-3 text-sm text-ink-soft">Nossa equipe vai confirmar a disponibilidade e os detalhes com você. Para agilizar, envie o código pelo WhatsApp.</p>
        {waHref && <ButtonLink href={whatsappUrl(whatsapp, msg)} variant="whatsapp" size="lg" className="mt-5 w-full"><WhatsAppIcon />Enviar pelo WhatsApp</ButtonLink>}
      </div>
    );
  }

  if (!bookable) {
    return (
      <div className="rounded-3xl bg-white p-6 ring-1 ring-duna-800/10">
        <p className="font-display text-xl font-semibold text-ink">{blockedLabel ?? 'Indisponível'}</p>
        <p className="mt-1 text-sm text-ink-soft">Este passeio não está recebendo reservas pelo site agora. Fale com a gente para ver outras datas e opções.</p>
        <button disabled className="mt-5 h-12 w-full cursor-not-allowed rounded-full bg-slate-200 font-semibold text-slate-500">{blockedLabel ?? 'Indisponível'}</button>
        {waHref && <ButtonLink href={waHref} variant="whatsapp" className="mt-3 w-full"><WhatsAppIcon />Falar no WhatsApp</ButtonLink>}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-duna-800/10 sm:p-6" noValidate>
      <div>
        <h3 className="text-xl font-semibold text-ink">Reserve sua experiência</h3>
        <p className="mt-0.5 text-sm text-ink-muted">Sem pagamento agora. Confirmamos tudo com você.</p>
      </div>
      <input type="hidden" name="tourId" value={tourId} />
      <input type="hidden" name="people" value={people} />
      <div className="hidden" aria-hidden><label>Site<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

      {hasSlots ? (
        <>
          <Field label="Data" error={fe.scheduleId}>
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Datas disponíveis">
              {dates.map((d) => {
                const free = slots.filter((s) => s.date === d && s.status === 'aberto').reduce((a, s) => a + s.available, 0);
                return (
                  <button key={d} type="button" role="radio" aria-checked={date === d} disabled={free === 0}
                    onClick={() => { setDate(d); setScheduleId(''); }}
                    className={cn('min-w-[4.5rem] shrink-0 rounded-2xl px-3 py-2 text-center ring-1 ring-inset transition-colors disabled:opacity-40',
                      date === d ? 'bg-duna-800 text-white ring-duna-800' : 'bg-white text-ink ring-duna-800/15 hover:ring-lagoa-500')}>
                    <span className="block text-xs capitalize opacity-80">{fmtDate(d, { weekday: 'short' }).replace('.', '')}</span>
                    <span className="block font-display text-lg font-semibold leading-tight">{fmtDate(d, { day: '2-digit' })}</span>
                    <span className="block text-xs capitalize opacity-80">{fmtDate(d, { month: 'short' }).replace('.', '')}</span>
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Horário" error={fe.scheduleId}>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Horários">
              {daySlots.map((s) => {
                const full = s.available <= 0 || s.status !== 'aberto';
                return (
                  <button key={s.schedule_id} type="button" role="radio" aria-checked={scheduleId === s.schedule_id} disabled={full}
                    onClick={() => setScheduleId(s.schedule_id)}
                    className={cn('rounded-2xl px-3 py-2.5 text-left ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      scheduleId === s.schedule_id ? 'bg-lagoa-50 ring-2 ring-lagoa-500' : 'ring-duna-800/15 hover:ring-lagoa-500')}>
                    <span className="block font-semibold text-ink">{fmtTime(s.start_time) || 'Horário a combinar'}</span>
                    <span className={cn('block text-xs', full ? 'text-red-600' : s.available <= 3 ? 'text-sol-700' : 'text-emerald-700')}>
                      {full ? 'Esgotado' : `${s.available} vaga${s.available > 1 ? 's' : ''}`}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="scheduleId" value={scheduleId} />
          </Field>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <input type="hidden" name="scheduleId" value="" />
          <Field label="Data desejada" htmlFor="bk-date" error={fe.date} required>
            <Input id="bk-date" name="date" type="date" min={addDaysISO(todayISO(), 0)} required invalid={!!fe.date} />
          </Field>
          <Field label="Horário" htmlFor="bk-time">
            <Select id="bk-time" name="time" placeholder="Sem preferência" options={defaultTimes.map((t) => ({ value: t, label: t }))} />
          </Field>
          <p className="col-span-2 -mt-1 flex items-center gap-1.5 text-xs text-ink-muted"><CalendarDays className="size-3.5" />Confirmaremos a disponibilidade para a data escolhida.</p>
        </div>
      )}

      <Field label="Pessoas" error={fe.people}>
        <div className="flex items-center justify-between rounded-xl px-2 py-1.5 ring-1 ring-inset ring-duna-800/15">
          <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} className="grid size-9 place-items-center rounded-full hover:bg-lagoa-50" aria-label="Menos pessoas"><Minus className="size-4" /></button>
          <span className="font-display text-lg font-semibold" aria-live="polite">{people} {people > 1 ? 'pessoas' : 'pessoa'}</span>
          <button type="button" onClick={() => setPeople((p) => Math.min(selected?.available || 50, p + 1))} className="grid size-9 place-items-center rounded-full hover:bg-lagoa-50" aria-label="Mais pessoas"><Plus className="size-4" /></button>
        </div>
      </Field>

      <Field label="Seu nome" htmlFor="bk-name" error={fe.name} required><Input id="bk-name" name="name" autoComplete="name" required invalid={!!fe.name} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="WhatsApp" htmlFor="bk-phone" error={fe.phone} required><Input id="bk-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(98) 90000-0000" required invalid={!!fe.phone} /></Field>
        <Field label="E-mail" htmlFor="bk-email" error={fe.email}><Input id="bk-email" name="email" type="email" autoComplete="email" invalid={!!fe.email} /></Field>
      </div>
      <Field label="Observações" htmlFor="bk-notes" error={fe.notes}><Textarea id="bk-notes" name="notes" rows={2} placeholder="Crianças, hotel, preferências…" /></Field>

      {state && !state.ok && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p>}

      <Button type="submit" variant="accent" size="lg" loading={pending} className="w-full" disabled={hasSlots && !scheduleId}>
        {hasSlots && !scheduleId ? 'Escolha um horário' : 'Solicitar reserva'}
      </Button>
      {waHref && <ButtonLink href={waHref} variant="whatsapp" className="w-full"><WhatsAppIcon />Reservar pelo WhatsApp</ButtonLink>}
    </form>
  );
}
