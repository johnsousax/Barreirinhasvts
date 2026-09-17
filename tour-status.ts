import type { Availability, BookingStatus, LeadStage, TourStatus } from './types';

export type Tone = 'green' | 'amber' | 'red' | 'gray' | 'blue' | 'navy' | 'orange';

export const TOUR_STATUS: Record<TourStatus, { label: string; tone: Tone; bookable: boolean; cta?: string }> = {
  disponivel:    { label: 'Disponível',    tone: 'green',  bookable: true },
  poucas_vagas:  { label: 'Poucas vagas',  tone: 'amber',  bookable: true },
  ultimas_vagas: { label: 'Últimas vagas', tone: 'red',    bookable: true },
  esgotado:      { label: 'Esgotado',      tone: 'gray',   bookable: false, cta: 'Vagas esgotadas' },
  encerrado:     { label: 'Encerrado',     tone: 'gray',   bookable: false, cta: 'Passeio encerrado' },
  em_breve:      { label: 'Em breve',      tone: 'blue',   bookable: false, cta: 'Em breve' },
  oculto:        { label: 'Oculto',        tone: 'gray',   bookable: false, cta: 'Indisponível' },
};

const MANUAL_LOCK: TourStatus[] = ['esgotado', 'encerrado', 'em_breve', 'oculto'];

/**
 * Status exibido no site: o status manual do painel tem prioridade quando
 * bloqueia reservas; caso contrário as vagas reais podem "rebaixar" o status.
 */
export function effectiveStatus(status: TourStatus, avail?: Availability | null, threshold = 0.2): TourStatus {
  if (MANUAL_LOCK.includes(status)) return status;
  if (avail && avail.schedules > 0) {
    if (avail.available <= 0) return 'esgotado';
    const ratio = avail.available / Math.max(avail.capacity, 1);
    if (avail.available <= 2 || ratio <= threshold / 2) return 'ultimas_vagas';
    if (ratio <= threshold && status === 'disponivel') return 'poucas_vagas';
  }
  return status;
}

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  pendente:             { label: 'Pendente',             tone: 'amber' },
  confirmada:           { label: 'Confirmada',           tone: 'blue' },
  aguardando_pagamento: { label: 'Aguardando pagamento', tone: 'orange' },
  pago:                 { label: 'Pago',                 tone: 'green' },
  cancelada:            { label: 'Cancelada',            tone: 'red' },
  concluida:            { label: 'Concluída',            tone: 'navy' },
  nao_compareceu:       { label: 'Não compareceu',       tone: 'gray' },
};

export const LEAD_STAGES: { key: LeadStage; label: string; tone: Tone }[] = [
  { key: 'novo',             label: 'Novo',             tone: 'blue' },
  { key: 'em_atendimento',   label: 'Em atendimento',   tone: 'amber' },
  { key: 'proposta_enviada', label: 'Proposta enviada', tone: 'orange' },
  { key: 'aguardando',       label: 'Aguardando',       tone: 'gray' },
  { key: 'reservado',        label: 'Reservado',        tone: 'green' },
  { key: 'concluido',        label: 'Concluído',        tone: 'navy' },
  { key: 'perdido',          label: 'Perdido',          tone: 'red' },
];

export const PUBLICATION: Record<string, { label: string; tone: Tone }> = {
  rascunho:  { label: 'Rascunho',  tone: 'amber' },
  publicado: { label: 'Publicado', tone: 'green' },
  arquivado: { label: 'Arquivado', tone: 'gray' },
};

export const SCHEDULE_STATUS: Record<string, { label: string; tone: Tone }> = {
  aberto:    { label: 'Aberto',    tone: 'green' },
  fechado:   { label: 'Fechado',   tone: 'gray' },
  cancelado: { label: 'Cancelado', tone: 'red' },
  realizado: { label: 'Realizado', tone: 'navy' },
};

export const TOUR_TYPE: Record<string, string> = {
  compartilhado: 'Compartilhado', privativo: 'Privativo', ambos: 'Compartilhado ou privativo',
};

export const SEAT_HOLDING: BookingStatus[] = ['confirmada', 'aguardando_pagamento', 'pago', 'concluida'];
export const REVENUE_STATUSES: BookingStatus[] = ['pago', 'concluida'];
