'use client';
import Link from 'next/link';
import { markNotificationsRead, type NotificationItem } from '@/actions/notifications';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/components/ui/cn';
import { fmtDateTime } from '@/lib/format';
import { NOTIF_ICON } from './NotificationBell';
import { useAction } from './useAction';

export function NotificationsList({ items }: { items: NotificationItem[] }) {
  const { pending, exec } = useAction();
  const unread = items.filter((n) => !n.read).map((n) => n.id);
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-duna-800/[.07] p-4">
        <p className="text-sm text-ink-muted">{unread.length} não lidas</p>
        <Button size="sm" variant="secondary" disabled={!unread.length} loading={pending} onClick={() => exec(() => markNotificationsRead(unread))}>Marcar todas como lidas</Button>
      </div>
      {items.length === 0 ? <EmptyState title="Nenhuma notificação." description="Você será avisado sobre novas reservas, leads e vagas acabando." /> : (
        <ul className="divide-y divide-duna-800/[.06]">
          {items.map((n) => {
            const meta = NOTIF_ICON[n.kind] ?? NOTIF_ICON.new_booking;
            const body = (
              <>
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', meta.cls)}><meta.icon className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{n.title}</span>
                  {n.body && <span className="block text-sm text-ink-soft">{n.body}</span>}
                  <span className="block text-xs text-ink-muted">{fmtDateTime(n.created_at)}</span>
                </span>
                {!n.read && <span className="size-2.5 shrink-0 rounded-full bg-sol-500" aria-label="Não lida" />}
              </>
            );
            return (
              <li key={n.id} className={cn(!n.read && 'bg-lagoa-50/50')}>
                {n.link
                  ? <Link href={n.link} onClick={() => !n.read && markNotificationsRead([n.id])} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">{body}</Link>
                  : <div className="flex items-center gap-4 px-4 py-3">{body}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
