import { AlertTriangle, Inbox } from 'lucide-react';
import { cn } from './cn';

export function EmptyState({ title, description, action, icon: Icon = Inbox, className }: { title: string; description?: React.ReactNode; action?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="grid size-12 place-items-center rounded-2xl bg-lagoa-50 text-lagoa-600"><Icon className="size-6" /></div>
      <p className="mt-4 font-display text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Não foi possível carregar os dados.', description, action }: { title?: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="size-6" /></div>
      <p className="mt-4 font-display text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-xl bg-duna-800/[.06] after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent', className)} />;
}
