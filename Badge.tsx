import { cn } from './cn';

const tones: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  orange: 'bg-sol-50 text-sol-700 ring-sol-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  blue: 'bg-lagoa-50 text-lagoa-700 ring-lagoa-600/20',
  navy: 'bg-duna-800/5 text-duna-800 ring-duna-800/20',
};

export function Badge({ tone = 'gray', children, className, dot }: { tone?: string; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap', tones[tone] ?? tones.gray, className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export function PlaceholderBadge() {
  return <Badge tone="orange" className="!font-medium">Conteúdo demonstrativo</Badge>;
}
