'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Images, Loader2, Trash2, Upload } from 'lucide-react';
import { listMedia, type MediaItem } from '@/actions/media';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Img } from '@/components/ui/Img';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/components/ui/cn';
import { uploadMedia } from './upload';

export function MediaPicker({ open, onClose, onPick, multiple }: { open: boolean; onClose: () => void; onPick: (urls: string[]) => void; multiple?: boolean }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setSelected([]);
    listMedia().then(setItems).catch(() => setItems([]));
  }, [open]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const f of Array.from(files)) uploaded.push(await uploadMedia(f, 'geral'));
      setItems((prev) => [...uploaded, ...(prev ?? [])]);
      setSelected((s) => (multiple ? [...s, ...uploaded.map((u) => u.url)] : [uploaded[0].url]));
      toast.success(`${uploaded.length} arquivo(s) enviado(s).`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha no envio.');
    } finally {
      setUploading(false);
    }
  };
  const images = (items ?? []).filter((m) => m.kind === 'image' && (!filter || `${m.alt} ${m.category}`.toLowerCase().includes(filter.toLowerCase())));
  const toggle = (url: string) => setSelected((s) => (multiple ? (s.includes(url) ? s.filter((x) => x !== url) : [...s, url]) : [url]));

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Biblioteca de mídia" description="Escolha uma imagem já enviada ou envie uma nova."
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button disabled={!selected.length} onClick={() => { onPick(selected); onClose(); }}>Usar {selected.length > 1 ? `${selected.length} imagens` : 'imagem'}</Button>
      </>}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Filtrar por nome ou categoria" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <input ref={fileRef} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => onFiles(e.target.files)} />
        <Button variant="secondary" loading={uploading} onClick={() => fileRef.current?.click()}><Upload className="size-4" />Enviar do dispositivo</Button>
      </div>
      {items === null ? (
        <div className="grid h-40 place-items-center"><Loader2 className="size-6 animate-spin text-lagoa-500" /></div>
      ) : images.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">Nenhuma imagem na biblioteca. Envie a primeira.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((m) => {
            const idx = selected.indexOf(m.url);
            return (
              <li key={m.id}>
                <button type="button" onClick={() => toggle(m.url)} aria-pressed={idx >= 0}
                  className={cn('relative block aspect-square w-full overflow-hidden rounded-xl ring-2 ring-offset-2 transition', idx >= 0 ? 'ring-lagoa-500' : 'ring-transparent')}>
                  <Img src={m.url} alt={m.alt ?? ''} fill sizes="160px" className="object-cover" />
                  {idx >= 0 && <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-lagoa-500 text-xs font-bold text-white">{multiple ? idx + 1 : '✓'}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

export function ImageInput({ value, onChange, id, invalid }: { value: string | null | undefined; onChange: (v: string) => void; id?: string; invalid?: boolean }) {
  const [picker, setPicker] = useState(false);
  return (
    <div className="flex gap-3">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-duna-800/10">
        {value ? <Img src={value} alt="" fill sizes="80px" className="object-cover" /> : <ImagePlus className="absolute inset-0 m-auto size-6 text-ink-muted" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Input id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="Cole um link ou escolha da biblioteca" invalid={invalid} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPicker(true)}><Images className="size-4" />Biblioteca / enviar</Button>
          {value && <Button size="sm" variant="ghost" onClick={() => onChange('')}>Remover</Button>}
        </div>
      </div>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(u) => onChange(u[0])} />
    </div>
  );
}

export function MultiImageInput({ value, onChange, max = 20 }: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const [picker, setPicker] = useState(false);
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {value.map((url, i) => (
          <li key={url + i} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <Img src={url} alt="" fill sizes="140px" className="object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-duna-800 px-2 py-0.5 text-[10px] font-semibold text-white">Capa</span>}
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              <span className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-lg bg-white/90 disabled:opacity-40" aria-label="Mover para a esquerda"><ArrowUp className="size-3.5 -rotate-90" /></button>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-lg bg-white/90 disabled:opacity-40" aria-label="Mover para a direita"><ArrowDown className="size-3.5 -rotate-90" /></button>
              </span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-lg bg-white/90 text-red-600" aria-label="Remover foto"><Trash2 className="size-3.5" /></button>
            </div>
          </li>
        ))}
        {value.length < max && (
          <li>
            <button type="button" onClick={() => setPicker(true)} className="grid aspect-square w-full place-items-center rounded-xl border-2 border-dashed border-duna-800/15 text-ink-muted hover:border-lagoa-500 hover:text-lagoa-600">
              <span className="flex flex-col items-center gap-1 text-xs font-medium"><ImagePlus className="size-6" />Adicionar</span>
            </button>
          </li>
        )}
      </ul>
      <MediaPicker multiple open={picker} onClose={() => setPicker(false)} onPick={(u) => onChange(Array.from(new Set([...value, ...u])).slice(0, max))} />
    </div>
  );
}
