'use client';
import { useMemo, useState } from 'react';
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { deleteResource, saveResource, toggleResource } from '@/actions/resources';
import { RESOURCES, type FieldDef } from '@/lib/resources';
import { Badge, PlaceholderBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { Drawer, Modal } from '@/components/ui/Modal';
import { Dropdown, MenuItem } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/States';
import { Img } from '@/components/ui/Img';
import { Table, Td, Th } from '@/components/ui/Table';
import { Stars } from '@/components/site/Blocks';
import { fmtDate } from '@/lib/format';
import { cn } from '@/components/ui/cn';
import { ImageInput } from './ImageInput';
import { useAction } from './useAction';

type Row = Record<string, any> & { id: string };
type Options = Partial<Record<'tours' | 'destinations', { value: string; label: string }[]>>;

function toLocalInput(v: string | null) {
  if (!v) return '';
  const d = new Date(v);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyValues(fields: FieldDef[]) {
  return Object.fromEntries(fields.map((f) => [f.name,
    f.type === 'boolean' ? ['visible', 'active'].includes(f.name) ? f.name === 'visible' : false
      : f.type === 'rating' ? 5 : f.type === 'number' ? 0 : f.type === 'select' && f.options && f.required ? f.options[0].value : '']));
}

function FieldInput({ f, value, onChange, error, options }: { f: FieldDef; value: any; onChange: (v: any) => void; error?: string; options: Options }) {
  const id = `f-${f.name}`;
  let input: React.ReactNode;
  switch (f.type) {
    case 'textarea': input = <Textarea id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={f.name === 'answer' || f.name === 'description' ? 5 : 3} invalid={!!error} />; break;
    case 'number': input = <Input id={id} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} invalid={!!error} />; break;
    case 'date': input = <Input id={id} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} invalid={!!error} />; break;
    case 'datetime': input = <Input id={id} type="datetime-local" value={value ?? ''} onChange={(e) => onChange(e.target.value)} invalid={!!error} />; break;
    case 'select': input = <Select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.required ? undefined : 'Nenhum'} options={f.options ?? options[f.optionsFrom!] ?? []} invalid={!!error} />; break;
    case 'boolean': return <div className="sm:col-span-2"><Switch id={id} checked={!!value} onChange={onChange} label={<span>{f.label}{f.help && <span className="block text-xs text-ink-muted">{f.help}</span>}</span>} /></div>;
    case 'image': input = <ImageInput id={id} value={value} onChange={onChange} invalid={!!error} />; break;
    case 'rating': input = (
      <div className="flex gap-1" role="radiogroup" aria-label={f.label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)} aria-label={`${n} estrelas`}>
            <Star className={cn('size-7', n <= (value ?? 0) ? 'fill-sol-500 text-sol-500' : 'text-slate-300')} />
          </button>
        ))}
      </div>
    ); break;
    default: input = <Input id={id} type={f.type === 'url' ? 'url' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} invalid={!!error} />;
  }
  return <Field label={f.label} htmlFor={id} error={error} help={f.help} required={f.required} className={f.full ? 'sm:col-span-2' : ''}>{input}</Field>;
}

export function ResourceManager({ resourceKey, rows, options = {} }: { resourceKey: string; rows: Row[]; options?: Options }) {
  const def = RESOURCES[resourceKey];
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [confirm, setConfirm] = useState<Row | null>(null);
  const { pending, errors, setErrors, exec } = useAction();

  const list = useMemo(() => rows.filter((r) =>
    (!q || def.searchColumns.some((c) => String(r[c] ?? '').toLowerCase().includes(q.toLowerCase())))
    && (!filter || !def.filter || r[def.filter.name] === filter)), [rows, q, filter, def]);

  const openEdit = (row: Row | 'new') => {
    setErrors({});
    if (row === 'new') setValues(emptyValues(def.fields));
    else setValues(Object.fromEntries(def.fields.map((f) => [f.name, f.type === 'datetime' ? toLocalInput(row[f.name]) : row[f.name] ?? (f.type === 'boolean' ? false : '')])));
    setEditing(row);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    exec(() => saveResource(def.key, editing === 'new' ? null : (editing as Row).id, values), { onSuccess: () => setEditing(null) });
  };

  const renderCell = (r: Row, c: (typeof def.columns)[number]) => {
    const v = r[c.name];
    switch (c.kind) {
      case 'image': return <span className="relative block size-12 overflow-hidden rounded-lg bg-slate-100"><Img src={v} alt="" fill sizes="48px" className="object-cover" /></span>;
      case 'badge': { const b = c.badge?.[v]; return b ? <Badge tone={b.tone}>{b.label}</Badge> : v; }
      case 'date': return fmtDate(v);
      case 'rating': return <Stars value={v} />;
      case 'relation': return v?.name ?? '—';
      default: return <span className="line-clamp-2">{v ?? '—'}</span>;
    }
  };

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 border-b border-duna-800/[.07] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="pl-9" aria-label="Buscar" />
          </div>
          {def.filter && <Select aria-label={def.filter.label} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`${def.filter.label}: todos`} options={def.filter.options} className="sm:w-56" />}
          <Button onClick={() => openEdit('new')}><Plus className="size-4" />Novo {def.singular}</Button>
        </div>
        {list.length === 0 ? (
          <EmptyState title={rows.length ? 'Nada encontrado com esses filtros.' : def.emptyText} action={!rows.length && <Button onClick={() => openEdit('new')}><Plus className="size-4" />Adicionar</Button>} />
        ) : (
          <Table>
            <thead><tr>{def.columns.map((c) => <Th key={c.name} className={c.hideMobile ? 'hidden md:table-cell' : ''}>{c.label}</Th>)}{def.toggles.length > 0 && <Th className="hidden sm:table-cell">Status</Th>}<Th className="w-12"><span className="sr-only">Ações</span></Th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  {def.columns.map((c, i) => (
                    <Td key={c.name} className={cn(c.hideMobile && 'hidden md:table-cell', i === 1 && 'font-medium')}>
                      {i === (def.columns[0].kind === 'image' ? 1 : 0)
                        ? <button className="text-left hover:text-lagoa-600" onClick={() => openEdit(r)}>{renderCell(r, c)}{def.placeholderFlag && r[def.placeholderFlag] && <span className="mt-1 block"><PlaceholderBadge /></span>}</button>
                        : renderCell(r, c)}
                    </Td>
                  ))}
                  {def.toggles.length > 0 && (
                    <Td className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {def.toggles.map((t) => <Badge key={t.name} tone={r[t.name] ? (t.name === 'featured' ? 'orange' : 'green') : 'gray'}>{r[t.name] ? t.onLabel : t.offLabel}</Badge>)}
                      </div>
                    </Td>
                  )}
                  <Td>
                    <Dropdown trigger={({ toggle }) => <button onClick={toggle} className="rounded-full p-2 hover:bg-slate-100" aria-label="Ações"><MoreHorizontal className="size-4" /></button>}>
                      {(close) => (
                        <>
                          <MenuItem onClick={() => { close(); openEdit(r); }}><Pencil className="size-4" />Editar</MenuItem>
                          {def.toggles.map((t) => (
                            <MenuItem key={t.name} onClick={() => { close(); exec(() => toggleResource(def.key, r.id, t.name, !r[t.name])); }}>
                              {t.name === 'featured' ? <Star className="size-4" /> : r[t.name] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              {r[t.name] ? `Marcar como ${t.offLabel.toLowerCase()}` : `Marcar como ${t.onLabel.toLowerCase()}`}
                            </MenuItem>
                          ))}
                          <MenuItem danger onClick={() => { close(); setConfirm(r); }}><Trash2 className="size-4" />Excluir</MenuItem>
                        </>
                      )}
                    </Dropdown>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? `Novo ${def.singular}` : `Editar ${def.singular}`}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" form="resource-form" loading={pending}>Salvar</Button></>}>
        <form id="resource-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {def.fields.map((f) => (
            <FieldInput key={f.name} f={f} value={values[f.name]} options={options} error={errors[f.name]}
              onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
          ))}
        </form>
      </Drawer>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} size="sm" title={`Excluir ${def.singular}?`}
        description={`"${confirm?.[def.labelField] ?? ''}" será removido permanentemente.${def.toggles.length ? ' Para apenas tirar do site, use "ocultar".' : ''}`}
        footer={<><Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button><Button variant="danger" loading={pending} onClick={() => exec(() => deleteResource(def.key, confirm!.id), { onSuccess: () => setConfirm(null) })}>Excluir</Button></>} />
    </>
  );
}
