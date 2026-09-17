export type Role = 'admin' | 'gerente' | 'atendente';
export type PublicationStatus = 'rascunho' | 'publicado' | 'arquivado';
export type TourStatus = 'disponivel' | 'poucas_vagas' | 'ultimas_vagas' | 'esgotado' | 'encerrado' | 'em_breve' | 'oculto';
export type ScheduleStatus = 'aberto' | 'fechado' | 'cancelado' | 'realizado';
export type BookingStatus = 'pendente' | 'confirmada' | 'aguardando_pagamento' | 'pago' | 'cancelada' | 'concluida' | 'nao_compareceu';
export type LeadStage = 'novo' | 'em_atendimento' | 'proposta_enviada' | 'aguardando' | 'reservado' | 'concluido' | 'perdido';

export interface ItineraryStep { time?: string; title: string; description?: string }

export interface Category { id: string; name: string; slug: string; sort_order: number; active: boolean }

export interface Destination {
  id: string; name: string; slug: string; short_description: string | null; description: string | null;
  image_url: string | null; location: string | null; status: PublicationStatus; sort_order: number; is_placeholder: boolean;
}

export interface Tour {
  id: string; slug: string; name: string; short_description: string | null; description: string | null;
  category_id: string | null; destination_id: string | null; tour_type: 'compartilhado' | 'privativo' | 'ambos';
  duration_label: string | null; duration_minutes: number | null; price: number | null; promo_price: number | null;
  price_note: string | null; capacity: number; default_times: string[]; meeting_point: string | null;
  itinerary: ItineraryStep[]; included: string[]; not_included: string[]; recommendations: string[]; important_info: string[];
  cover_url: string | null; photos: string[]; video_url: string | null; status: TourStatus; publication: PublicationStatus;
  featured: boolean; sort_order: number; whatsapp_message: string | null; seo_title: string | null; seo_description: string | null;
  draft_data: Record<string, unknown> | null; is_placeholder: boolean; updated_at: string; created_at: string;
  category?: { name: string; slug: string } | null;
  destination?: { name: string; slug: string } | null;
}

export interface Availability { tour_id: string; schedules: number; capacity: number; available: number; next_date: string | null }
export interface ScheduleSlot { schedule_id: string; date: string; start_time: string | null; capacity: number; available: number; status: ScheduleStatus }

export interface ScheduleRow {
  id: string; tour_id: string; date: string; start_time: string | null; capacity: number; manual_occupied: number;
  status: ScheduleStatus; notes: string | null; booked: number; pending: number; available: number;
}

export interface Review {
  id: string; author_name: string; author_photo_url: string | null; author_city: string | null; rating: number;
  comment: string; review_date: string | null; tour_id: string | null; visible: boolean; featured: boolean;
  tour?: { name: string } | null;
}

export interface GalleryItem { id: string; image_url: string; title: string | null; category: string; featured: boolean }
export interface Faq { id: string; question: string; answer: string }
export interface Banner {
  id: string; title: string; subtitle: string | null; image_url: string | null; button_label: string | null;
  button_url: string | null; placement: string;
}

export interface Customer {
  id: string; name: string; phone: string | null; whatsapp: string | null; email: string | null; city: string | null;
  state: string | null; notes: string | null; source: string; first_contact_at: string; created_at: string;
}

export interface Lead {
  id: string; customer_id: string | null; name: string; phone: string | null; whatsapp: string | null; email: string | null;
  interest: string | null; tour_id: string | null; desired_date: string | null; people: number | null; notes: string | null;
  source: string; stage: LeadStage; lost_reason: string | null; position: number; created_at: string; updated_at: string;
  tour?: { name: string } | null;
}

export interface Booking {
  id: string; code: string; customer_id: string; tour_id: string; schedule_id: string | null; lead_id: string | null;
  date: string; start_time: string | null; people: number; unit_price: number | null; total_amount: number | null;
  status: BookingStatus; source: string; notes: string | null; created_at: string; updated_at: string;
  customer?: { id: string; name: string; phone: string | null; whatsapp: string | null; email: string | null } | null;
  tour?: { id: string; name: string; slug: string } | null;
}

export interface StaffUser {
  id: string; full_name: string; email: string | null; role: Role; active: boolean; avatar_url: string | null;
  permissions: string[];
}
