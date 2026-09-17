import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/supabase/env';
import { getDestinations, getTours } from '@/lib/data/public';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations] = await Promise.all([getTours(), getDestinations()]);
  const now = new Date();
  const statics = ['', '/passeios', '/destinos', '/sobre', '/galeria', '/depoimentos', '/faq', '/contato', '/politica-de-privacidade', '/termos'];
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.6 })),
    ...tours.map((t) => ({ url: `${SITE_URL}/passeios/${t.slug}`, lastModified: new Date(t.updated_at), changeFrequency: 'daily' as const, priority: 0.9 })),
    ...destinations.map((d) => ({ url: `${SITE_URL}/destinos/${d.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
