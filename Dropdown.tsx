'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from './cn';

export function Dropdown({ trigger, children, align = 'right', className }: { trigger: (p: { open: boolean; toggle: () => void }) => React.ReactNode; children: (close: () => void) => React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={cn('absolute z-50 mt-2 min-w-48 animate-fade rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-duna-800/10', align === 'right' ? 'right-0' : 'left-0', className)}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ onClick, children, danger, disabled }: { onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm disabled:opacity-40', danger ? 'text-red-600 hover:bg-red-50' : 'text-ink hover:bg-lagoa-50')}>
      {children}
    </button>
  );
}
