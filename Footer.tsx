import Link from 'next/link';
import Image from 'next/image';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';
import { formatPhone } from '@/lib/format';
import { instagramUrl, type SiteSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';
import type { PublicTour } from '@/lib/data/public';

export function Footer({ settings: s, footer, tours }: { settings: SiteSettings; footer: { description: string; links: { label: string; href: string }[] }; tours: PublicTour[] }) {
  const year = new Date().getFullYear();
  const wa = whatsappUrl(s.whatsapp, s.whatsapp_message);
  const location = [s.address, [s.city, s.state].filter(Boolean).join(' - ')].filter(Boolean).join(', ');
  return (
    <footer className="bg-duna-950 text-white/75">
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="inline-block rounded-2xl bg-white px-4 py-3">
            <Image src={s.logo_url || '/brand/logo.png'} alt={s.company_name} width={769} height={378} className="h-12 w-auto" unoptimized={!s.logo_url.startsWith('/')} />
          </div>
          <p className="mt-5 max-w-xs leading-relaxed">{footer.description}</p>
          <div className="mt-6 flex gap-2">
            {s.instagram && <a href={instagramUrl(s.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><InstagramIcon /></a>}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><WhatsAppIcon /></a>}
          </div>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="font-display text-base font-semibold text-white">Navegação</h2>
          <ul className="mt-4 space-y-2.5">
            {[['/', 'Início'], ['/passeios', 'Passeios'], ['/destinos', 'Destinos'], ['/sobre', 'Sobre nós'], ['/depoimentos', 'Depoimentos'], ['/galeria', 'Galeria'], ...footer.links.map((l) => [l.href, l.label])].map(([href, label]) => (
              <li key={`${href}${label}`}><Link href={href} className="hover:text-sol-400">{label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-semibold text-white">Passeios</h2>
          <ul className="mt-4 space-y-2.5">
            {tours.slice(0, 6).map((t) => <li key={t.id}><Link href={`/passeios/${t.slug}`} className="hover:text-sol-400">{t.name}</Link></li>)}
            {!tours.length && <li>Em breve</li>}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-base font-semibold text-white">Contato</h2>
          <ul className="mt-4 space-y-3">
            {s.whatsapp && <li><a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-sol-400"><WhatsAppIcon className="size-4 shrink-0" />{formatPhone(s.whatsapp)}</a></li>}
            {s.phone && <li><a href={`tel:${s.phone.replace(/\D/g, '')}`} className="flex items-center gap-2.5 hover:text-sol-400"><Phone className="size-4 shrink-0" />{formatPhone(s.phone)}</a></li>}
            {s.email && <li><a href={`mailto:${s.email}`} className="flex items-center gap-2.5 break-all hover:text-sol-400"><Mail className="size-4 shrink-0" />{s.email}</a></li>}
            {s.instagram && <li><a href={instagramUrl(s.instagram)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-sol-400"><InstagramIcon className="size-4 shrink-0" />@{s.instagram}</a></li>}
            {location && <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0" />{s.maps_url ? <a href={s.maps_url} target="_blank" rel="noopener noreferrer" className="hover:text-sol-400">{location}</a> : location}</li>}
            {s.business_hours && <li className="flex items-start gap-2.5"><Clock className="mt-0.5 size-4 shrink-0" />{s.business_hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {s.company_name}. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/politica-de-privacidade" className="hover:text-white">Política de privacidade</Link>
            <Link href="/termos" className="hover:text-white">Termos de uso</Link>
            <a href="https://www.instagram.com/jonsousax" target="_blank" rel="noopener noreferrer" className="hover:text-white">Site desenvolvido por @jonsousax</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
