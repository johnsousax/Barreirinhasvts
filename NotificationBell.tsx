'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Bell, Ticket, UserPlus, XCircle } from 'lucide-react';
import { listNotifications, markNotificationsRead, type NotificationItem } from '@/actions/notifications';
import { Dropdown } from '@/components/ui/Dropdown';
import { cn } from '@/components/ui/cn';
import { timeAgo } from '@/lib/format';

export const NOTIF_ICON: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  new_booking: { icon: Ticket, cls: 'bg-lagoa-50 text-lagoa-600' },
  new_lead: { icon: UserPlus, cls: 'bg-emerald-50 text-emerald-600' },
  low_seats: { icon: AlertTriangle, cls: 'bg-sol-50 text-sol-600' },
  sold_out: { icon: AlertTriangle, cls: 'bg-red-50 text-red-600' },
  booking_cancelled: { icon: XCircle, cls: 'bg-red-50 text-red-600' },
};

export function NotificationBell() {
  const [data, setData] = useState<{ items: NotificationItem[]; unread: number }>({ items: [], unread: 0 });
  const router = useRouter();
  const load = useCallback(() => { listNotifications(12).then(setData).catch(() => {}); }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const open = (n: NotificationItem, close: () => void) => {
    close();
    markNotificationsRead([n.id]).then(load);
    if (n.link) router.push(n.link);
  };

  return (
    <Dropdown className="w-[min(22rem,calc(100vw-2rem))] !p-0" trigger={({ toggle, open: o }) => (
      <button onClick={toggle} aria-expanded={o} aria-label={`Notificações${data.unread ? `, ${data.unread} não lidas` : ''}`} className="relative rounded-full p-2 text-ink-soft hover:bg-slate-100">
        <Bell className="size-5" />
        {data.unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-sol-500 px-1 text-[10px] font-bold text-duna-950">{data.unread > 9 ? '9+' : data.unread}</span>}
      </button>
    )}>
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-duna-800/[.07] px-4 py-3">
            <p className="font-semibold">Notificações</p>
            {data.unread > 0 && <button className="text-xs font-semibold text-lagoa-600" onClick={() => markNotificationsRead(data.items.filter((n) => !n.read).map((n) => n.id)).then(load)}>Marcar todas como lidas</button>}
          </div>
          <ul className="max-h-96 overflow-y-auto p-1.5">
            {data.items.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-muted">Nenhuma notificação.</li>}
            {data.items.map((n) => {
              const meta = NOTIF_ICON[n.kind] ?? NOTIF_ICON.new_booking;
              return (
                <li key={n.id}>
                  <button onClick={() => open(n, close)} className={cn('flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left hover:bg-slate-50', !n.read && 'bg-lagoa-50/60')}>
                    <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', meta.cls)}><meta.icon className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{n.title}</span><span className="shrink-0 text-xs text-ink-muted">{timeAgo(n.created_at)}</span></span>
                      {n.body && <span className="line-clamp-2 text-xs text-ink-soft">{n.body}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link href="/admin/notificacoes" onClick={close} className="block border-t border-duna-800/[.07] py-2.5 text-center text-sm font-semibold text-lagoa-600">Ver todas</Link>
        </div>
      )}
    </Dropdown>
  );
}
