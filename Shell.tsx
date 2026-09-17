'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3, Bell, CalendarDays, Compass, FileText, History, Image as ImageIcon, Images, Kanban, LayoutDashboard,
  Lightbulb, LogOut, Map, Megaphone, Menu, Quote, Search, Settings, Ticket, UserRound, UsersRound, X, ExternalLink, HelpCircle,
} from 'lucide-react';
import { signOut } from '@/actions/auth';
import { Dropdown, MenuItem } from '@/components/ui/Dropdown';
import { cn } from '@/components/ui/cn';
import { ROLE_LABEL } from '@/lib/permissions';
import type { StaffUser } from '@/lib/types';
import { NotificationBell } from './NotificationBell';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; perm: string };
const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Operação', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view' },
    { href: '/admin/passeios', label: 'Passeios', icon: Compass, perm: 'tours.view' },
    { href: '/admin/calendario', label: 'Calendário', icon: CalendarDays, perm: 'tours.view' },
    { href: '/admin/reservas', label: 'Reservas', icon: Ticket, perm: 'bookings.manage' },
    { href: '/admin/clientes', label: 'Clientes', icon: UserRound, perm: 'customers.manage' },
    { href: '/admin/leads', label: 'Leads', icon: Kanban, perm: 'leads.manage' },
    { href: '/admin/destinos', label: 'Destinos', icon: Map, perm: 'destinations.manage' },
  ] },
  { group: 'Site', items: [
    { href: '/admin/conteudo', label: 'Conteúdo do site', icon: FileText, perm: 'content.manage' },
    { href: '/admin/galeria', label: 'Galeria', icon: Images, perm: 'content.manage' },
    { href: '/admin/depoimentos', label: 'Depoimentos', icon: Quote, perm: 'content.manage' },
    { href: '/admin/faq', label: 'FAQ', icon: HelpCircle, perm: 'content.manage' },
    { href: '/admin/banners', label: 'Banners', icon: Megaphone, perm: 'content.manage' },
    { href: '/admin/midia', label: 'Mídia', icon: ImageIcon, perm: 'content.manage' },
  ] },
  { group: 'Gestão', items: [
    { href: '/admin/ideias', label: 'Ideias', icon: Lightbulb, perm: 'ideas.manage' },
    { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3, perm: 'reports.view' },
    { href: '/admin/notificacoes', label: 'Notificações', icon: Bell, perm: 'notifications.view' },
    { href: '/admin/usuarios', label: 'Usuários', icon: UsersRound, perm: 'users.manage' },
    { href: '/admin/auditoria', label: 'Auditoria', icon: History, perm: 'audit.view' },
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings, perm: 'settings.manage' },
  ] },
];

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

function SidebarNav({ staff, logo, onNavigate }: { staff: StaffUser; logo: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="rounded-xl bg-white px-2.5 py-1.5"><Image src={logo} alt="Aventure Turismo" width={769} height={378} className="h-7 w-auto" unoptimized={!logo.startsWith('/')} /></span>
        <span className="text-xs font-medium text-white/50">Painel</span>
      </div>
      <nav aria-label="Painel" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
        {NAV.map((g) => {
          const items = g.items.filter((i) => staff.permissions.includes(i.perm));
          if (!items.length) return null;
          return (
            <div key={g.group}>
              <p className="px-3 pb-1.5 text-xs font-medium text-white/40">{g.group}</p>
              <ul className="space-y-0.5">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                        className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-[14.5px] font-medium transition-colors',
                          active ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white')}>
                        <Icon className={cn('size-[18px]', active && 'text-sol-400')} />{label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white"><ExternalLink className="size-4" />Ver site</a>
      </div>
    </div>
  );
}

export function AdminShell({ staff, logo, children }: { staff: StaffUser; logo: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    const target = staff.permissions.includes('bookings.manage') ? '/admin/reservas' : '/admin/clientes';
    router.push(`${target}?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-duna-950 lg:block"><SidebarNav staff={staff} logo={logo} /></aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <div className="absolute inset-0 animate-fade bg-duna-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-rise bg-duna-950">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-full p-2 text-white/70" aria-label="Fechar menu"><X className="size-5" /></button>
            <SidebarNav staff={staff} logo={logo} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-duna-800/[.07] bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="-ml-1 rounded-full p-2 text-ink lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button>
          <form onSubmit={search} role="search" className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, código de reserva…" aria-label="Buscar"
              className="h-10 w-full rounded-full bg-slate-100 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-lagoa-500" />
          </form>
          <div className="ml-auto flex items-center gap-1.5">
            {staff.permissions.includes('notifications.view') && <NotificationBell />}
            <Dropdown trigger={({ toggle, open: o }) => (
              <button onClick={toggle} aria-expanded={o} className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100">
                <span className="grid size-8 place-items-center rounded-full bg-lagoa-500 text-sm font-semibold text-white">{(staff.full_name || staff.email || '?').charAt(0).toUpperCase()}</span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{staff.full_name || staff.email}</span>
                  <span className="block text-xs text-ink-muted">{ROLE_LABEL[staff.role]}</span>
                </span>
              </button>
            )}>
              {(close) => (
                <>
                  <div className="px-3 py-2 text-xs text-ink-muted">{staff.email}</div>
                  <MenuItem onClick={() => { close(); router.push('/admin/perfil'); }}><UserRound className="size-4" />Meu perfil</MenuItem>
                  <MenuItem onClick={() => { close(); window.open('/', '_blank'); }}><ExternalLink className="size-4" />Ver site</MenuItem>
                  <MenuItem onClick={() => signOut()} danger><LogOut className="size-4" />Sair</MenuItem>
                </>
              )}
            </Dropdown>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions, back }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && <Link href={back.href} className="mb-1 inline-flex text-sm font-medium text-lagoa-600 hover:underline">← {back.label}</Link>}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}


