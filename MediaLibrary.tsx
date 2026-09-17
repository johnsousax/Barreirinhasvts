'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Film, Trash2, Upload } from 'lucide-react';
import { deleteMedia, updateMedia, type MediaItem } from '@/actions/media';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { Img } from '@/components/ui/Img';
import { useToast } from '@/components/ui/Toast';
import { fmtDate } from '@/lib/format';
import { uploadMedia } from './upload';
import { useAction } from './useAction';

const CATEGORIES = ['geral', 'passeios', 'lagoas', 'quadriciclo', 'clientes', 'experiencias', 'destinos', 'banners', 'depoimentos', 'site'];

export function MediaLibrary({ items, canDelete }: { items: MediaItem[]; canDelete: boolean }) {
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [uploadCat, setUploadCat] = useState('geral');
  const [uploading, setUploading] = useState(0);
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [meta, setMeta] = useState({ alt: '', category: 'geral' });
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();
  const { pending, exec } = useAction();
  const list = items.filter((m) => (!cat || m.category === cat) && (!q || `${m.alt} ${m.path}`.toLowerCase().includes(q.toLowerCase())));

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const arr = Array.from(files);
    setUploading(arr.length);
    let ok = 0;
    for (const f of arr) {
      try { await uploadMedia(f, uploadCat); ok++; } catch (e) { toast.error(`${f.name}: ${e instanceof Error ? e.message : 'falhou'}`); }
      setUploading((n) => n - 1);
    }
    if (ok) toast.success(`${ok} arquivo(s) enviado(s) e otimizado(s).`);
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  };

  return (
    <>
      <Card
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
        <div className="flex flex-col gap-2 border-b border-duna-800/[.07] p-4 lg:flex-row lg:items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar arquivo" aria-label="Buscar" className="lg:max-w-xs" />
          <Select aria-label="Categoria" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Todas as categorias" options={CATEGORIES.map((c) => ({ value: c, label: c }))} className="lg:w-48" />
          <div className="flex gap-2 lg:ml-auto">
            <Select aria-label="Categoria do envio" value={uploadCat} onChange={(e) => setUploadCat(e.target.value)} options={CATEGORIES.map((c) => ({ value: c, label: `Enviar em: ${c}` }))} className="w-48" />
            <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            <Button loading={uploading > 0} onClick={() => fileRef.current?.click()}><Upload className="size-4" />{uploading ? `Enviando ${uploading}…` : 'Enviar arquivos'}</Button>
          </div>
        </div>
        <p className="px-4 pt-3 text-xs text-ink-muted">Arraste arquivos para esta área. Imagens são redimensionadas (máx. 2000px) e convertidas para WebP automaticamente.</p>
        {list.length === 0 ? <EmptyState title="Nenhum arquivo." /> : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 xl:grid-cols-6">
            {list.map((m) => (
              <li key={m.id}>
                <button onClick={() => { setSel(m); setMeta({ alt: m.alt ?? '', category: m.category }); }} className="group block w-full text-left">
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-slate-100">
                    {m.kind === 'video' ? <Film className="absolute inset-0 m-auto size-8 text-ink-muted" /> : <Img src={m.url} alt={m.alt ?? ''} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />}
                  </span>
                  <span className="mt-1 block truncate text-xs text-ink-soft">{m.alt || m.path?.split('/').pop() || m.url.split('/').pop()}</span>
                  <span className="block text-[11px] text-ink-muted">{m.category}{m.size_bytes ? ` · ${Math.round(m.size_bytes / 1024)} KB` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} size="lg" title="Detalhes do arquivo"
        footer={<>
          {canDelete && sel?.path && <Button variant="ghost" className="mr-auto text-red-600" loading={pending} onClick={() => exec(() => deleteMedia(sel.id), { onSuccess: () => setSel(null) })}><Trash2 className="size-4" />Excluir</Button>}
          <Button variant="ghost" onClick={() => setSel(null)}>Fechar</Button>
          <Button loading={pending} onClick={() => exec(() => updateMedia(sel!.id, meta), { onSuccess: () => setSel(null) })}>Salvar</Button>
        </>}>
        {sel && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              {sel.kind === 'video' ? <video src={sel.url} controls className="size-full object-contain" /> : <Img src={sel.url} alt={sel.alt ?? ''} fill sizes="400px" className="object-contain" />}
            </div>
            <div className="space-y-4">
              <Field label="Descrição (texto alternativo)" htmlFor="m-alt"><Input id="m-alt" value={meta.alt} onChange={(e) => setMeta({ ...meta, alt: e.target.value })} /></Field>
              <Field label="Categoria" htmlFor="m-cat"><Select id="m-cat" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} /></Field>
              <Field label="Link">
                <div className="flex gap-2"><Input readOnly value={sel.url} /><Button variant="secondary" aria-label="Copiar link" onClick={() => { navigator.clipboard.writeText(sel.url); toast.success('Link copiado.'); }}><Copy className="size-4" /></Button></div>
              </Field>
              <p className="text-xs text-ink-muted">{sel.width && sel.height ? `${sel.width}×${sel.height}px · ` : ''}Enviado em {fmtDate(sel.created_at)}</p>
              {!sel.path && <p className="text-xs text-ink-muted">Arquivo do pacote inicial do site (não pode ser excluído por aqui).</p>}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
