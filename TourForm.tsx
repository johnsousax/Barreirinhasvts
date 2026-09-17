'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { discardTourDraft, saveTour, type TourInput } from '@/actions/tours';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { TOUR_STATUS, PUBLICATION } from '@/lib/tour-status';
import { slugify } from '@/lib/format';
import type { ItineraryStep, Tour, TourStatus } from '@/lib/types';
import { MultiImageInput } from './ImageInput';
import { useAction } from './useAction';

type Opt = { value: string; label: string };
type Values = {
  name: string; slug: string; short_description: string; description: string;
  category_id: string; destination_id: string; tour_type: 'compartilhado' | 'privativo' | 'ambos';
  duration_label: string; duration_minutes: string; price: string; promo_price: string; price_note: string;
  capacity: string; default_times: string[]; meeting_point: string; itinerary: ItineraryStep[];
  included: string[]; not_included: string[]; recommendations: string[]; important_info: string[];
  cover_url: string; photos: string[]; video_url: string; status: TourStatus; featured: boolean; sort_order: string;
  whatsapp_message: string; seo_title: string; seo_description: string; is_placeholder: boolean;
};

function toValues(t: Partial<Tour> | null): Values {
  const src = { ...(t ?? {}), ...((t?.draft_data as Partial<Tour>) ?? {}) };
  const str = (v: unknown) => (v == null ? '' : String(v));
  return {
    name: src.name ?? '', slug: src.slug ?? '', short_description: src.short_description ?? '', description: src.description ?? '',
    category_id: src.category_id ?? '', destination_id: src.destination_id ?? '', tour_type: src.tour_type ?? 'compartilhado',
    duration_label: src.duration_label ?? '', duration_minutes: str(src.duration_minutes), price: str(src.price), promo_price: str(src.promo_price),
    price_note: src.price_note ?? 'por pessoa', capacity: str(src.capacity ?? 0), default_times: src.default_times ?? [],
    meeting_point: src.meeting_point ?? '', itinerary: (src.itinerary as ItineraryStep[]) ?? [],
    included: src.included ?? [], not_included: src.not_included ?? [], recommendations: src.recommendations ?? [], important_info: src.important_info ?? [],
    cover_url: src.cover_url ?? '', photos: Array.from(new Set([src.cover_url, ...(src.photos ?? [])].filter(Boolean) as string[])),
    video_url: src.video_url ?? '', status: src.status ?? 'disponivel', featured: src.featured ?? false, sort_order: str(src.sort_order ?? 0),
    whatsapp_message: src.whatsapp_message ?? '', seo_title: src.seo_title ?? '', seo_description: src.seo_description ?? '',
    is_placeholder: src.is_placeholder ?? false,
  };
}

function ListEditor({ label, value, onChange, placeholder, help }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; help?: string }) {
  return (
    <Field label={label} help={help ?? 'Um item por linha.'}>
      <Textarea rows={4} value={value.join('\n')} placeholder={placeholder} onChange={(e) => onChange(e.target.value.split('\n'))} />
    </Field>
  );
}

export function TourForm({ tour, categories, destinations }: { tour: Tour | null; categories: Opt[]; destinations: Opt[] }) {
  const [v, setV] = useState<Values>(() => toValues(tour));
  const [slugTouched, setSlugTouched] = useState(!!tour);
  const [timesText, setTimesText] = useState(v.default_times!.join(', '));
  const { pending, errors, exec } = useAction();
  const router = useRouter();
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((s) => ({ ...s, [k]: val }));
  const isPublished = tour?.publication === 'publicado';
  const hasDraft = !!tour?.draft_data;

  const payload = (): TourInput => ({
    ...v,
    slug: v.slug || slugify(v.name),
    default_times: timesText.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean),
    cover_url: v.photos?.[0] ?? '',
    included: v.included?.map((x) => x.trim()).filter(Boolean), not_included: v.not_included?.map((x) => x.trim()).filter(Boolean),
    recommendations: v.recommendations?.map((x) => x.trim()).filter(Boolean), important_info: v.important_info?.map((x) => x.trim()).filter(Boolean),
  });

  const save = (mode: 'draft' | 'publish') =>
    exec(() => saveTour(tour?.id ?? null, payload(), mode), {
      onSuccess: (d) => { if (!tour && d) router.push(`/admin/passeios/${d.id}`); },
    });

  const setStep = (i: number, patch: Partial<ItineraryStep>) => set('itinerary', v.itinerary!.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const moveStep = (i: number, d: number) => { const a = [...v.itinerary!]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); set('itinerary', a); };
  const e = errors;

  return (
    <form onSubmit={(ev) => { ev.preventDefault(); save('publish'); }} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {hasDraft && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sol-50 px-4 py-3 text-sm ring-1 ring-sol-500/25">
            <p><strong>Rascunho não publicado.</strong> Você está vendo as alterações salvas; o site ainda mostra a versão publicada.</p>
            <Button size="sm" variant="secondary" onClick={() => exec(() => discardTourDraft(tour!.id), { onSuccess: () => setV(toValues({ ...tour!, draft_data: null })) })}>Descartar rascunho</Button>
          </div>
        )}

        <Card>
          <CardHeader title="Informações" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Nome do passeio" htmlFor="t-name" error={e.name} required className="sm:col-span-2">
              <Input id="t-name" value={v.name} invalid={!!e.name} onChange={(ev) => { set('name', ev.target.value); if (!slugTouched) set('slug', slugify(ev.target.value)); }} />
            </Field>
            <Field label="Endereço no site" htmlFor="t-slug" help={`/passeios/${v.slug || '…'}`} className="sm:col-span-2">
              <Input id="t-slug" value={v.slug} onChange={(ev) => { setSlugTouched(true); set('slug', slugify(ev.target.value)); }} />
            </Field>
            <Field label="Categoria" htmlFor="t-cat"><Select id="t-cat" value={v.category_id ?? ''} onChange={(ev) => set('category_id', ev.target.value)} placeholder="Sem categoria" options={categories} /></Field>
            <Field label="Destino" htmlFor="t-dest"><Select id="t-dest" value={v.destination_id ?? ''} onChange={(ev) => set('destination_id', ev.target.value)} placeholder="Sem destino" options={destinations} /></Field>
            <Field label="Tipo" htmlFor="t-type">
              <Select id="t-type" value={v.tour_type} onChange={(ev) => set('tour_type', ev.target.value as Values['tour_type'])} options={[{ value: 'compartilhado', label: 'Compartilhado' }, { value: 'privativo', label: 'Privativo' }, { value: 'ambos', label: 'Compartilhado ou privativo' }]} />
            </Field>
            <Field label="Duração (texto)" htmlFor="t-dur" help='Ex.: "Meio período (aprox. 4h)"'><Input id="t-dur" value={v.duration_label ?? ''} onChange={(ev) => set('duration_label', ev.target.value)} /></Field>
            <Field label="Resumo" htmlFor="t-short" help="Aparece nos cards. Até 300 caracteres." error={e.short_description} className="sm:col-span-2">
              <Textarea id="t-short" rows={2} maxLength={300} value={v.short_description ?? ''} onChange={(ev) => set('short_description', ev.target.value)} />
            </Field>
            <Field label="Descrição completa" htmlFor="t-desc" className="sm:col-span-2">
              <Textarea id="t-desc" rows={7} value={v.description ?? ''} onChange={(ev) => set('description', ev.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Fotos e vídeo" description="A primeira foto é a capa. Arraste pelas setas para reordenar." />
          <div className="space-y-4 p-5">
            <MultiImageInput value={v.photos ?? []} onChange={(p) => set('photos', p)} />
            <Field label="Vídeo (YouTube ou link)" htmlFor="t-video" error={e.video_url}><Input id="t-video" type="url" value={v.video_url ?? ''} onChange={(ev) => set('video_url', ev.target.value)} placeholder="https://youtube.com/…" /></Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Preço, capacidade e horários" description="Deixe o preço vazio para mostrar “Consulte valores”." />
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Field label="Preço (R$)" htmlFor="t-price" error={e.price}><Input id="t-price" inputMode="decimal" value={v.price} onChange={(ev) => set('price', ev.target.value)} placeholder="A definir" /></Field>
            <Field label="Preço promocional (R$)" htmlFor="t-promo" error={e.promo_price}><Input id="t-promo" inputMode="decimal" value={v.promo_price} onChange={(ev) => set('promo_price', ev.target.value)} /></Field>
            <Field label="Complemento do preço" htmlFor="t-pnote"><Input id="t-pnote" value={v.price_note ?? ''} onChange={(ev) => set('price_note', ev.target.value)} placeholder="por pessoa" /></Field>
            <Field label="Capacidade padrão" htmlFor="t-cap" help="Usada ao criar novos horários." error={e.capacity}><Input id="t-cap" type="number" min={0} value={v.capacity} onChange={(ev) => set('capacity', ev.target.value)} /></Field>
            <Field label="Duração em minutos" htmlFor="t-min" help="Usado no filtro de duração." error={e.duration_minutes}><Input id="t-min" type="number" min={1} value={v.duration_minutes} onChange={(ev) => set('duration_minutes', ev.target.value)} /></Field>
            <Field label="Horários de saída" htmlFor="t-times" help="Separados por vírgula: 08:00, 14:00" error={e['default_times.0'] ?? e.default_times}><Input id="t-times" value={timesText} onChange={(ev) => setTimesText(ev.target.value)} /></Field>
            <Field label="Ponto de encontro" htmlFor="t-meet" className="sm:col-span-3"><Input id="t-meet" value={v.meeting_point ?? ''} onChange={(ev) => set('meeting_point', ev.target.value)} placeholder="Ex.: recepção da pousada (busca no hotel)" /></Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Roteiro" actions={<Button size="sm" variant="secondary" onClick={() => set('itinerary', [...v.itinerary!, { time: '', title: '', description: '' }])}><Plus className="size-4" />Etapa</Button>} />
          <div className="space-y-3 p-5">
            {v.itinerary!.length === 0 && <p className="text-sm text-ink-muted">Nenhuma etapa. Adicione o passo a passo do passeio.</p>}
            {v.itinerary!.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[90px_1fr_auto]">
                <Input aria-label="Horário" placeholder="08:00" value={s.time ?? ''} onChange={(ev) => setStep(i, { time: ev.target.value })} />
                <div className="space-y-2">
                  <Input aria-label="Título da etapa" placeholder="Título" value={s.title} onChange={(ev) => setStep(i, { title: ev.target.value })} />
                  <Textarea aria-label="Descrição da etapa" rows={2} placeholder="Descrição (opcional)" value={s.description ?? ''} onChange={(ev) => setStep(i, { description: ev.target.value })} />
                </div>
                <div className="flex gap-1 sm:flex-col">
                  <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => moveStep(i, -1)} aria-label="Subir"><ArrowUp className="size-4" /></Button>
                  <Button size="sm" variant="ghost" disabled={i === v.itinerary!.length - 1} onClick={() => moveStep(i, 1)} aria-label="Descer"><ArrowDown className="size-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => set('itinerary', v.itinerary!.filter((_, j) => j !== i))} aria-label="Remover"><Trash2 className="size-4 text-red-600" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Detalhes" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <ListEditor label="O que está incluso" value={v.included!} onChange={(x) => set('included', x)} />
            <ListEditor label="Não incluso" value={v.not_included!} onChange={(x) => set('not_included', x)} />
            <ListEditor label="Recomendações" value={v.recommendations!} onChange={(x) => set('recommendations', x)} />
            <ListEditor label="Informações importantes" value={v.important_info!} onChange={(x) => set('important_info', x)} />
          </div>
        </Card>

        <Card>
          <CardHeader title="WhatsApp e SEO" />
          <div className="grid gap-4 p-5">
            <Field label="Mensagem de WhatsApp deste passeio" htmlFor="t-wa" help="Vazio = usa a mensagem padrão das configurações. Use {passeio} para o nome.">
              <Textarea id="t-wa" rows={2} value={v.whatsapp_message ?? ''} onChange={(ev) => set('whatsapp_message', ev.target.value)} />
            </Field>
            <Field label="Título para o Google" htmlFor="t-seo" help={`${(v.seo_title ?? '').length}/70`} error={e.seo_title}><Input id="t-seo" maxLength={70} value={v.seo_title ?? ''} onChange={(ev) => set('seo_title', ev.target.value)} /></Field>
            <Field label="Descrição para o Google" htmlFor="t-seod" help={`${(v.seo_description ?? '').length}/170`} error={e.seo_description}><Textarea id="t-seod" rows={2} maxLength={170} value={v.seo_description ?? ''} onChange={(ev) => set('seo_description', ev.target.value)} /></Field>
          </div>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader title="Publicação" actions={tour && <Badge tone={PUBLICATION[tour.publication].tone}>{PUBLICATION[tour.publication].label}</Badge>} />
          <div className="space-y-4 p-5">
            <Field label="Status no site" htmlFor="t-status" help="Esgotado, Encerrado e Em breve bloqueiam reservas.">
              <Select id="t-status" value={v.status} onChange={(ev) => set('status', ev.target.value as Values['status'])}
                options={Object.entries(TOUR_STATUS).map(([k, m]) => ({ value: k, label: m.label }))} />
            </Field>
            <Field label="Ordem de exibição" htmlFor="t-order"><Input id="t-order" type="number" value={v.sort_order} onChange={(ev) => set('sort_order', ev.target.value)} /></Field>
            <Switch checked={!!v.featured} onChange={(x) => set('featured', x)} label="Destacar na página inicial" />
            <Switch checked={!!v.is_placeholder} onChange={(x) => set('is_placeholder', x)} label="Conteúdo demonstrativo" />
            <div className="grid gap-2 border-t border-duna-800/[.07] pt-4">
              <Button type="submit" variant="accent" loading={pending}>Publicar</Button>
              <Button variant="secondary" loading={pending} onClick={() => save('draft')}>Salvar rascunho</Button>
              {isPublished && tour && <a href={`/passeios/${tour.slug}`} target="_blank" className="inline-flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-lagoa-600 hover:underline"><ExternalLink className="size-4" />Ver no site</a>}
            </div>
            <p className="text-xs text-ink-muted">
              {isPublished ? '“Salvar rascunho” guarda as mudanças sem alterar o site.' : '“Salvar rascunho” mantém o passeio fora do site.'}
            </p>
          </div>
        </Card>
      </aside>
    </form>
  );
}
