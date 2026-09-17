import { cn } from './cn';

export function StatsCard({ label, value, hint, icon: Icon, tone = 'blue', href }: {
  label: string; value: React.ReactNode; hint?: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: 'blue' | 'orange' | 'navy' | 'green'; href?: string;
}) {
  const tones = { blue: 'bg-lagoa-50 text-lagoa-600', orange: 'bg-sol-50 text-sol-600', navy: 'bg-duna-800/5 text-duna-800', green: 'bg-emerald-50 text-emerald-600' };
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span className={cn('grid size-9 place-items-center rounded-xl', tones[tone])}><Icon className="size-[18px]" /></span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </>
  );
  const cls = 'block rounded-2xl bg-white p-4 ring-1 ring-duna-800/[.07] shadow-panel sm:p-5';
  return href ? <a href={href} className={cn(cls, 'transition-shadow hover:shadow-soft')}>{body}</a> : <div className={cls}>{body}</div>;
}
