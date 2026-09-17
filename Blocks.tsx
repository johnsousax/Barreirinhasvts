import Link from 'next/link';
import { ChevronDown, Quote, Star } from 'lucide-react';
import { Img } from '@/components/ui/Img';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { fmtDate } from '@/lib/format';
import type { Banner, Faq, Review } from '@/lib/types';

export function SectionHeading({ title, subtitle, align = 'left', action, className, id }: { title: string; subtitle?: string; align?: 'left' | 'center'; action?: React.ReactNode; className?: string; id?: string }) {
  return (
    <div className={cn('mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14', align === 'center' && 'flex-col items-center text-center', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        <h2 id={id} className="display-lg text-ink">{title}</h2>
        {subtitle && <p className="lead mt-4">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({ title, subtitle, image, children }: { title: string; subtitle?: string; image?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-duna-900">
      {image && <Img src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-duna-950/90 via-duna-950/40 to-duna-950/20" />
      <div className="container py-16 sm:py-24">
        <h1 className="display-lg max-w-3xl text-white">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} role="img" aria-label={`Nota ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('size-4', i < value ? 'fill-sol-500 text-sol-500' : 'text-slate-300')} />)}
    </span>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-duna-800/[.08] sm:p-7">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        <Quote className="size-7 text-sol-100" aria-hidden />
      </div>
      <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-ink">“{review.comment}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-lagoa-100">
          {review.author_photo_url
            ? <Img src={review.author_photo_url} alt="" fill sizes="44px" className="object-cover" />
            : <span className="grid size-full place-items-center font-display font-semibold text-lagoa-700">{review.author_name.charAt(0)}</span>}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-ink">{review.author_name}</span>
          <span className="block truncate text-sm text-ink-muted">
            {[review.author_city, review.tour?.name, review.review_date && fmtDate(review.review_date, { month: 'short', year: 'numeric' })].filter(Boolean).join(', ')}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-duna-800/10 rounded-3xl bg-white ring-1 ring-duna-800/[.08]">
      {faqs.map((f) => (
        <details key={f.id} className="group px-5 sm:px-7 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-semibold text-ink">
            {f.question}
            <ChevronDown className="size-5 shrink-0 text-lagoa-600 transition-transform group-open:rotate-180" />
          </summary>
          <p className="-mt-1 pb-5 leading-relaxed text-ink-soft">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function BannerStrip({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <div className="container space-y-3">
      {banners.map((b) => (
        <aside key={b.id} className="relative isolate flex min-h-40 flex-col justify-center overflow-hidden rounded-3xl bg-duna-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          {b.image_url && <Img src={b.image_url} alt="" fill sizes="1200px" className="-z-10 object-cover opacity-35" />}
          <div>
            <p className="font-display text-2xl font-semibold">{b.title}</p>
            {b.subtitle && <p className="mt-1 max-w-xl text-white/80">{b.subtitle}</p>}
          </div>
          {b.button_label && b.button_url && (
            <Link href={b.button_url} className={buttonClass('accent', 'md', 'mt-4 self-start sm:mt-0 sm:self-auto')}>{b.button_label}</Link>
          )}
        </aside>
      ))}
    </div>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function LegalText({ text }: { text: string }) {
  return (
    <div className="prose-legal">
      {text.split(/\n{2,}|\n(?=## )/).map((block, i) => {
        const b = block.trim();
        if (b.startsWith('## ')) {
          const [head, ...rest] = b.split('\n');
          return <div key={i}><h2>{head.slice(3)}</h2>{rest.length > 0 && <p>{rest.join(' ')}</p>}</div>;
        }
        return b ? <p key={i}>{b}</p> : null;
      })}
    </div>
  );
}
