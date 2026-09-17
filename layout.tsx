import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat';
import { JsonLd } from '@/components/site/Blocks';
import { getSections, getSettings, getTours } from '@/lib/data/public';
import { instagramUrl } from '@/lib/settings';
import { whatsappUrl, waDigits } from '@/lib/whatsapp';
import { SITE_URL } from '@/lib/supabase/env';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, section, tours] = await Promise.all([getSettings(), getSections(), getTours()]);
  const wa = whatsappUrl(s.whatsapp, s.whatsapp_message);
  const footer = section<{ description: string; links: { label: string; href: string }[] }>('footer');
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'TravelAgency', name: s.company_name, description: s.description,
        url: SITE_URL, logo: `${SITE_URL}${s.logo_url.startsWith('/') ? s.logo_url : ''}`, image: `${SITE_URL}${s.og_image}`,
        telephone: s.whatsapp ? `+${waDigits(s.whatsapp)}` : undefined, email: s.email || undefined,
        address: { '@type': 'PostalAddress', streetAddress: s.address || undefined, addressLocality: s.city, addressRegion: s.state, postalCode: s.zip || undefined, addressCountry: 'BR' },
        areaServed: ['Barreirinhas', 'Lençóis Maranhenses'],
        sameAs: [s.instagram && instagramUrl(s.instagram), s.facebook_url, s.tiktok_url, s.youtube_url].filter(Boolean),
      }} />
      <Header logo={s.logo_url || '/brand/logo.png'} company={s.company_name} whatsappHref={wa} />
      <main id="conteudo">{children}</main>
      <Footer settings={s} footer={footer} tours={tours} />
      <WhatsAppFloat href={wa} />
    </>
  );
}
