'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input,select,textarea,button:not([data-close])')?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="absolute inset-0 animate-fade bg-duna-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={ref} className={cn('relative w-full animate-rise rounded-t-3xl bg-white shadow-lift sm:rounded-3xl', { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' }[size])}>
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
          </div>
          <button data-close onClick={onClose} className="-m-2 rounded-full p-2 text-ink-muted hover:bg-slate-100" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        {children && <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-duna-800/[.07] px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, description, children, footer, width = 'md' }: {
  open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: 'md' | 'lg';
}) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="absolute inset-0 animate-fade bg-duna-950/40" onClick={onClose} />
      <div ref={ref} className={cn('absolute inset-y-0 right-0 flex w-full animate-slide-in flex-col bg-areia-50 shadow-lift', width === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="flex items-start justify-between gap-4 border-b border-duna-800/[.07] bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          <button data-close onClick={onClose} className="-m-1 rounded-full p-2 text-ink-muted hover:bg-slate-100" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-duna-800/[.07] bg-white px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
