'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { cn } from '@/components/ui/cn';

const NAV = [
  { href: '/', label: 'Início' },
  { href: '/passeios', label: 'Passeios' },
  { href: '/destinos', label: 'Destinos' },
  { href: '/#experiencias', label: 'Experiências' },
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/depoimentos', label: 'Depoimentos' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/faq', label: 'FAQ' },
];

export function Header({ logo, company, whatsappHref }: { logo: string; company: string; whatsappHref: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const active = (href: string) => (href.includes('#') ? false : href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={cn('sticky top-0 z-50 transition-[background,box-shadow] duration-300', open ? 'bg-white shadow-[0_1px_0_rgba(14,58,110,.08)]' : scrolled ? 'bg-white/95 shadow-[0_1px_0_rgba(14,58,110,.08)] backdrop-blur' : 'bg-white/80 backdrop-blur')}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-full focus:bg-duna-800 focus:px-4 focus:py-2 focus:text-white">Pular para o conteúdo</a>
      <div className={cn('container flex items-center justify-between gap-4 transition-[height] duration-300', scrolled ? 'h-16' : 'h-[4.5rem] lg:h-20')}>
        <Link href="/" className="shrink-0" aria-label={`${company} — página inicial`}>
          <Image src={logo} alt={company} width={769} height={378} priority unoptimized={!logo.startsWith('/')}
            className={cn('w-auto transition-[height] duration-300', scrolled ? 'h-9' : 'h-11 lg:h-12')} />
        </Link>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? 'page' : undefined}
                  className={cn('relative block rounded-full px-3 py-2 text-[15px] font-medium transition-colors', active(n.href) ? 'text-duna-800' : 'text-ink-soft hover:text-duna-800')}>
                  {n.label}
                  {active(n.href) && <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-sol-500" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"
              className="grid size-10 place-items-center rounded-full bg-[#1FAF55] text-white xl:hidden">
              <WhatsAppIcon />
            </a>
          )}
          <Link href="/passeios" className={buttonClass('accent', 'md', 'hidden sm:inline-flex')}>Reservar passeio</Link>
          <button onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-full text-duna-800 hover:bg-duna-800/5 xl:hidden"
            aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu" className="fixed inset-0 -z-10 animate-fade overflow-y-auto bg-white pt-[4.5rem] xl:hidden">
          <ul className="container space-y-1 py-6">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={cn('block rounded-2xl px-4 py-3.5 font-display text-2xl font-semibold', active(n.href) ? 'bg-lagoa-50 text-duna-800' : 'text-ink')}>{n.label}</Link>
              </li>
            ))}
            <li className="pt-4"><Link href="/passeios" className={buttonClass('accent', 'lg', 'w-full')}>Reservar passeio</Link></li>
            <li><Link href="/contato" className={buttonClass('secondary', 'lg', 'w-full')}>Contato</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
