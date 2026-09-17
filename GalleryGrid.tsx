'use client';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Img } from '@/components/ui/Img';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/components/ui/cn';
import type { GalleryItem } from '@/lib/types';

export function Lightbox({ items, index, onClose, onIndex }: { items: { image_url: string; title: string | null }[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [go, onClose]);
  const item = items[index];
  return (
    <div role="dialog" aria-modal="true" aria-label="Visualizar foto" className="fixed inset-0 z-[90] flex animate-fade items-center justify-center bg-duna-950/95 p-4">
      <button onClick={onClose} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Fechar"><X /></button>
      {items.length > 1 && <button onClick={() => go(-1)} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Foto anterior"><ChevronLeft /></button>}
      <figure className="relative h-[80vh] w-full max-w-5xl">
        <Img src={item.image_url} alt={item.title ?? ''} fill sizes="100vw" className="object-contain" />
        {item.title && <figcaption className="absolute -bottom-8 inset-x-0 text-center text-sm text-white/70">{item.title}</figcaption>}
      </figure>
      {items.length > 1 && <button onClick={() => go(1)} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Próxima foto"><ChevronRight /></button>}
    </div>
  );
}

export function GalleryGrid({ items, filterable = true, limit }: { items: GalleryItem[]; filterable?: boolean; limit?: number }) {
  const cats = Array.from(new Set(items.map((i) => i.category)));
  const [cat, setCat] = useState('todas');
  const [open, setOpen] = useState<number | null>(null);
  const list = (cat === 'todas' ? items : items.filter((i) => i.category === cat)).slice(0, limit);
  if (!items.length) return <EmptyState title="Galeria em construção" description="Em breve, fotos dos nossos passeios por aqui." />;
  return (
    <div>
      {filterable && cats.length > 1 && (
        <Tabs className="mb-6" value={cat} onChange={setCat} tabs={[{ key: 'todas', label: 'Todas' }, ...cats.map((c) => ({ key: c, label: c }))]} />
      )}
      <ul className="grid auto-rows-[9.5rem] grid-cols-2 gap-2 sm:auto-rows-[12rem] sm:gap-3 lg:grid-cols-4">
        {list.map((item, i) => (
          <li key={item.id} className={cn('relative overflow-hidden rounded-2xl', item.featured && 'col-span-2 row-span-2')}>
            <button onClick={() => setOpen(i)} className="group block size-full" aria-label={`Ampliar: ${item.title ?? 'foto'}`}>
              <Img src={item.image_url} alt={item.title ?? ''} fill sizes={item.featured ? '(min-width:1024px) 50vw, 100vw' : '(min-width:1024px) 25vw, 50vw'}
                className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

export function TourGallery({ photos, name }: { photos: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = photos.map((p, i) => ({ image_url: p, title: `${name} — foto ${i + 1}` }));
  if (!photos.length) return null;
  return (
    <>
      <div className="grid h-[52vh] min-h-[320px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:h-[60vh]">
        {photos.slice(0, 5).map((p, i) => (
          <button key={p + i} onClick={() => setOpen(i)} aria-label={`Ampliar foto ${i + 1}`}
            className={cn('group relative overflow-hidden', i === 0 ? 'col-span-4 row-span-2 sm:col-span-2' : 'hidden sm:block', photos.length === 2 && i === 1 && 'sm:col-span-2 sm:row-span-2', photos.length === 3 && i > 0 && 'sm:col-span-2')}>
            <Img src={p} alt={i === 0 ? name : ''} fill priority={i === 0} sizes={i === 0 ? '(min-width:640px) 50vw, 100vw' : '25vw'} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            {i === 4 && photos.length > 5 && <span className="absolute inset-0 grid place-items-center bg-duna-950/50 font-display text-2xl font-semibold text-white">+{photos.length - 5}</span>}
          </button>
        ))}
      </div>
      {photos.length > 1 && <button onClick={() => setOpen(0)} className="mt-3 text-sm font-semibold text-lagoa-600 hover:underline sm:hidden">Ver as {photos.length} fotos</button>}
      {open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
