const TZ = 'America/Fortaleza';

export const brl = (v: number | null | undefined) =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const num = (v: number | null | undefined) => (v ?? 0).toLocaleString('pt-BR');

/** Datas "YYYY-MM-DD" são tratadas como data local, sem fuso. */
export function parseDate(d: string) {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, day, 12);
}

export function fmtDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!d) return '—';
  const date = d.length <= 10 ? parseDate(d) : new Date(d);
  return date.toLocaleDateString('pt-BR', { ...opts, timeZone: d.length <= 10 ? undefined : TZ });
}

export function fmtDateLong(d: string | null | undefined) {
  return fmtDate(d, { weekday: 'short', day: '2-digit', month: 'short' });
}

export function fmtDateTime(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: TZ });
}

export const fmtTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : '');

export function timeAgo(d: string) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'agora';
  const m = Math.round(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.round(h / 24);
  if (days < 30) return `há ${days} d`;
  return fmtDate(d);
}

/** Data de hoje (YYYY-MM-DD) no fuso de Barreirinhas. */
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

export function addDaysISO(iso: string, days: number) {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function formatPhone(p: string | null | undefined) {
  const d = (p ?? '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p ?? '';
}

export function lines(v: string | null | undefined) {
  return (v ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
}

/** Primeira letra maiúscula (evita “19 De Set” do text-transform). */
export const capFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
