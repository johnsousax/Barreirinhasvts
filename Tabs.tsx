'use client';
import { cn } from './cn';

export function Tabs({ tabs, value, onChange, className }: { tabs: { key: string; label: React.ReactNode }[]; value: string; onChange: (k: string) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]', className)}>
      {tabs.map((t) => (
        <button
          key={t.key} role="tab" type="button" aria-selected={value === t.key} onClick={() => onChange(t.key)}
          className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoa-500',
            value === t.key ? 'bg-duna-800 text-white' : 'text-ink-soft hover:bg-duna-800/5')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
