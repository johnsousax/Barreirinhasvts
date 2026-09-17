'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { discardSectionDraft, publishAllSections, publishSection, saveSectionDraft } from '@/actions/content';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { cn } from '@/components/ui/cn';
import { BENEFIT_ICONS, CMS_SECTIONS, type CmsField } from '@/lib/cms-schema';
import { fmtDateTime } from '@/lib/format';
import { ImageInput, MultiImageInput } from './ImageInput';
import { useAction } from './useAction';

type SectionState = { key: string; draft: Record<string, any>; has_unpublished: boolean; published_at: string | null };
const PREVIEW: Record<string, string> = { contact_page: '/contato', legal: '/politica-de-privacidade', footer: '/', about: '/sobre', gallery_section: '/galeria', reviews_section: '/depoimentos', faq_section: '/faq' };

function FieldEditor({ field, value, onChange }: { field: CmsField; value: any; onChange: (v: any) => void }) {
  const id = `cms-${field.name}`;
  if (field.type === 'image') return <Field label={field.label} help={field.help}><ImageInput id={id} value={value} onChange={onChange} /></Field>;
  if (field.type === 'images') return <Field label={field.label} help={field.help}><MultiImageInput value={value ?? []} onChange={onChange} max={12} /></Field>;
  if (field.type === 'textarea') return <Field label={field.label} htmlFor={id} help={field.help}><Textarea id={id} rows={field.name === 'privacy' || field.name === 'terms' ? 14 : 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></Field>;
  if (field.type === 'list') {
    const items: Record<string, string>[] = value ?? [];
    const update = (i: number, k: string, val: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: val } : it)));
    const move = (i: number, d: number) => { const a = [...items]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); onChange(a); };
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">{field.label}</p>
          <Button size="sm" variant="secondary" onClick={() => onChange([...items, Object.fromEntries(field.fields.map((f) => [f.name, f.type === 'icon' ? 'sparkles' : '']))])}><Plus className="size-4" />{field.itemLabel}</Button>
        </div>
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i} className="rounded-2xl bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">{field.itemLabel} {i + 1}</span>
                <span className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir"><ArrowUp className="size-4" /></Button>
                  <Button size="sm" variant="ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Descer"><ArrowDown className="size-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remover"><Trash2 className="size-4 text-red-600" /></Button>
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {field.fields.map((f) => (
                  <div key={f.name} className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : ''}>
                    {f.type === 'image' ? <Field label={f.label}><ImageInput value={it[f.name]} onChange={(v) => update(i, f.name, v)} /></Field>
                      : f.type === 'icon' ? <Field label={f.label}><Select value={it[f.name] ?? ''} onChange={(e) => update(i, f.name, e.target.value)} options={BENEFIT_ICONS.map((x) => ({ value: x, label: x }))} /></Field>
                      : f.type === 'textarea' ? <Field label={f.label}><Textarea rows={2} value={it[f.name] ?? ''} onChange={(e) => update(i, f.name, e.target.value)} /></Field>
                      : <Field label={f.label}><Input value={it[f.name] ?? ''} onChange={(e) => update(i, f.name, e.target.value)} /></Field>}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <Field label={field.label} htmlFor={id} help={field.help}><Input id={id} type={field.type === 'url' ? 'url' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></Field>;
}

export function ContentEditor({ sections }: { sections: SectionState[] }) {
  const map = Object.fromEntries(sections.map((s) => [s.key, s]));
  const [active, setActive] = useState(CMS_SECTIONS[0].key);
  const [drafts, setDrafts] = useState<Record<string, Record<string, any>>>(() =>
    Object.fromEntries(CMS_SECTIONS.map((s) => [s.key, { ...s.defaults, ...(map[s.key]?.draft ?? {}) }])));
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const { pending, exec } = useAction();
  const section = CMS_SECTIONS.find((s) => s.key === active)!;
  const state = map[active];
  const pendingCount = sections.filter((s) => s.has_unpublished).length;
  const set = (name: string, v: unknown) => { setDrafts((d) => ({ ...d, [active]: { ...d[active], [name]: v } })); setDirty((s) => new Set(s).add(active)); };
  const clean = () => setDirty((s) => { const n = new Set(s); n.delete(active); return n; });

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit p-2 lg:sticky lg:top-24">
        <nav aria-label="Seções do site">
          <ul className="scrollbar-none flex gap-1 overflow-x-auto lg:block lg:space-y-0.5">
            {CMS_SECTIONS.map((s) => (
              <li key={s.key} className="shrink-0">
                <button onClick={() => setActive(s.key)} aria-current={active === s.key}
                  className={cn('flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium', active === s.key ? 'bg-duna-800 text-white' : 'hover:bg-slate-100')}>
                  {s.label}
                  {(map[s.key]?.has_unpublished || dirty.has(s.key)) && <span className="size-2 shrink-0 rounded-full bg-sol-500" title="Alterações não publicadas" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {pendingCount > 0 && <Button variant="accent" size="sm" className="mt-2 w-full" loading={pending} onClick={() => exec(() => publishAllSections())}>Publicar tudo ({pendingCount})</Button>}
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-duna-800/[.07] p-5">
          <div>
            <h2 className="font-display text-lg font-semibold">{section.label}</h2>
            <p className="text-sm text-ink-muted">{section.description}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {dirty.has(active) ? <Badge tone="amber">Alterações não salvas</Badge> : state?.has_unpublished ? <Badge tone="amber">Rascunho salvo, não publicado</Badge> : <Badge tone="green">Publicado</Badge>}
              {state?.published_at && <span className="ml-2">Última publicação: {fmtDateTime(state.published_at)}</span>}
            </p>
          </div>
          <a href={PREVIEW[active] ?? '/'} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-lagoa-600 hover:underline"><ExternalLink className="size-4" />Ver no site</a>
        </div>
        <div className="space-y-5 p-5">
          {section.fields.map((f) => <FieldEditor key={f.name} field={f} value={drafts[active][f.name]} onChange={(v) => set(f.name, v)} />)}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-duna-800/[.07] p-4">
          {state?.has_unpublished && !dirty.has(active) && <Button variant="ghost" loading={pending} onClick={() => exec(() => discardSectionDraft(active), { onSuccess: () => window.location.reload() })}>Descartar rascunho</Button>}
          <Button variant="secondary" loading={pending} onClick={() => exec(() => saveSectionDraft(active, drafts[active]), { onSuccess: clean })}>Salvar rascunho</Button>
          <Button variant="accent" loading={pending} onClick={() => exec(() => publishSection(active, drafts[active]), { onSuccess: clean })}>Publicar</Button>
        </div>
      </Card>
    </div>
  );
}
