import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { Img } from '@/components/ui/Img';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { TOUR_STATUS, TOUR_TYPE } from '@/lib/tour-status';
import { brl, fmtDate } from '@/lib/format';
import type { PublicTour } from '@/lib/data/public';

export function TourPrice({ tour, className }: { tour: PublicTour; className?: string }) {
  const price = tour.promo_price ?? tour.price;
  if (price == null) return <p className={cn('font-display text-lg font-semibold text-duna-800', className)}>Consulte valores</p>;
  return (
    <div className={className}>
      <p className="text-xs text-ink-muted">a partir de</p>
      <p className="font-display text-2xl font-semibold tracking-tight text-duna-800">
        {tour.promo_price != null && tour.price != null && <s className="mr-2 text-sm font-normal text-ink-muted">{brl(tour.price)}</s>}
        {brl(price)}
        {tour.price_note && <span className="ml-1 font-sans text-xs font-normal text-ink-muted">{tour.price_note}</span>}
      </p>
    </div>
  );
}

export function StatusBadge({ status }: { status: PublicTour['display_status'] }) {
  if (status === 'disponivel') return null;
  const meta = TOUR_STATUS[status];
  return <Badge tone={meta.tone} dot className="bg-white/95 backdrop-blur">{meta.label}</Badge>;
}

export function TourCard({ tour, variant = 'default', priority }: { tour: PublicTour; variant?: 'default' | 'wide'; priority?: boolean }) {
  const meta = TOUR_STATUS[tour.display_status];
  const href = `/passeios/${tour.slug}`;
  const wide = variant === 'wide';
  return (
    <article className={cn('group relative flex overflow-hidden rounded-3xl bg-white ring-1 ring-duna-800/[.08] transition-shadow hover:shadow-lift', wide ? 'flex-col lg:flex-row' : 'flex-col')}>
      <Link href={href} className={cn('relative block overflow-hidden', wide ? 'aspect-[4/3] lg:aspect-auto lg:w-[56%]' : 'aspect-[4/3]')} tabIndex={-1} aria-hidden>
        <Img src={tour.cover_url} alt="" fill priority={priority} sizes={wide ? '(min-width:1024px) 640px, 100vw' : '(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <StatusBadge status={tour.display_status} />
          {tour.category && <Badge tone="navy" className="bg-white/95">{tour.category.name}</Badge>}
        </div>
      </Link>
      <div className={cn('flex flex-1 flex-col p-5 sm:p-6', wide && 'lg:justify-center lg:p-10')}>
        {tour.destination && <p className="flex items-center gap-1.5 text-sm font-medium text-lagoa-600"><MapPin className="size-4" />{tour.destination.name}</p>}
        <h3 className={cn('mt-1.5 font-semibold tracking-tight text-ink', wide ? 'display-md' : 'text-xl')}>
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{tour.name}</Link>
        </h3>
        {tour.short_description && <p className={cn('mt-2 text-ink-soft', wide ? 'text-lg' : 'line-clamp-2 text-[15px]')}>{tour.short_description}</p>}
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
          <li className="flex items-center gap-1.5"><Clock className="size-4" />{tour.duration_label || 'Duração a confirmar'}</li>
          <li className="flex items-center gap-1.5"><Users className="size-4" />{TOUR_TYPE[tour.tour_type]}</li>
          {tour.availability?.next_date && meta.bookable && (
            <li className="flex items-center gap-1.5"><CalendarDays className="size-4" />Próxima saída {fmtDate(tour.availability.next_date, { day: '2-digit', month: 'short' })}</li>
          )}
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <TourPrice tour={tour} />
          <div className="relative z-10 flex gap-2">
            <Link href={href} className={buttonClass('secondary', 'sm')}>Ver detalhes</Link>
            {meta.bookable
              ? <Link href={`${href}#reservar`} className={buttonClass('accent', 'sm')}>Reservar</Link>
              : <span className={buttonClass('secondary', 'sm', 'pointer-events-none opacity-60')} aria-disabled>{meta.cta}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
