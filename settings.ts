export interface SiteSettings {
  company_name: string; tagline: string; description: string; logo_url: string; favicon_url: string;
  phone: string; whatsapp: string; whatsapp_message: string; whatsapp_tour_message: string; email: string;
  instagram: string; facebook_url: string; tiktok_url: string; youtube_url: string;
  address: string; city: string; state: string; zip: string; maps_url: string; business_hours: string;
  seo_title: string; seo_description: string; og_image: string;
  low_seats_threshold: number; show_closed_tours: boolean;
  notify_email: string; notify_new_booking: boolean; notify_new_lead: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  company_name: 'Aventure Turismo',
  tagline: 'Viva grandes experiências',
  description: 'Passeios, experiências e aventuras nos Lençóis Maranhenses, saindo de Barreirinhas - MA.',
  logo_url: '/brand/logo.png',
  favicon_url: '/brand/icon.png',
  phone: '',
  whatsapp: '5598992396818',
  whatsapp_message: 'Olá! Vim pelo site da Aventure Turismo e gostaria de informações sobre os passeios.',
  whatsapp_tour_message: 'Olá! Vim pelo site da Aventure Turismo e gostaria de informações sobre o passeio {passeio}.',
  email: '',
  instagram: 'aventure_turismo',
  facebook_url: '', tiktok_url: '', youtube_url: '',
  address: '', city: 'Barreirinhas', state: 'MA', zip: '', maps_url: '', business_hours: '',
  seo_title: 'Aventure Turismo | Passeios nos Lençóis Maranhenses em Barreirinhas - MA',
  seo_description: 'Passeios, experiências e aventuras nos Lençóis Maranhenses: lagoas, dunas e quadriciclo saindo de Barreirinhas - MA. Reserve pelo site ou WhatsApp.',
  og_image: '/images/og-cover.jpg',
  low_seats_threshold: 0.2,
  show_closed_tours: true,
  notify_email: '', notify_new_booking: true, notify_new_lead: true,
};

export function mergeSettings(data: Partial<SiteSettings> | null | undefined): SiteSettings {
  const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const [k, v] of Object.entries(data ?? {})) if (v !== null && v !== undefined) out[k] = v;
  return out as unknown as SiteSettings;
}

export const instagramUrl = (handle: string) => (handle ? `https://www.instagram.com/${handle.replace(/^@/, '')}` : '');

type SettingField = { name: keyof SiteSettings; label: string; type?: 'text' | 'textarea' | 'image' | 'number' | 'boolean' | 'email' | 'url'; help?: string; required?: boolean };
export const SETTINGS_TABS: { key: string; label: string; fields: SettingField[] }[] = [
  { key: 'empresa', label: 'Empresa', fields: [
    { name: 'company_name', label: 'Nome da empresa', required: true },
    { name: 'tagline', label: 'Slogan' },
    { name: 'description', label: 'Descrição curta', type: 'textarea' },
    { name: 'logo_url', label: 'Logotipo', type: 'image', help: 'Use o arquivo oficial. PNG com fundo transparente funciona melhor.' },
    { name: 'favicon_url', label: 'Favicon (ícone da aba)', type: 'image' },
  ] },
  { key: 'contato', label: 'Contato', fields: [
    { name: 'phone', label: 'Telefone' },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'business_hours', label: 'Horário de atendimento', help: 'Ex.: Todos os dias, das 7h às 20h' },
  ] },
  { key: 'whatsapp', label: 'WhatsApp', fields: [
    { name: 'whatsapp', label: 'Número do WhatsApp (com DDD)', required: true, help: 'Somente números. O site gera os links wa.me automaticamente.' },
    { name: 'whatsapp_message', label: 'Mensagem padrão', type: 'textarea' },
    { name: 'whatsapp_tour_message', label: 'Mensagem para passeios', type: 'textarea', help: 'Use {passeio} para inserir o nome do passeio. Cada passeio pode ter a sua própria mensagem.' },
  ] },
  { key: 'redes', label: 'Instagram e redes', fields: [
    { name: 'instagram', label: 'Usuário do Instagram', help: 'Sem o @' },
    { name: 'facebook_url', label: 'Facebook (link)', type: 'url' },
    { name: 'tiktok_url', label: 'TikTok (link)', type: 'url' },
    { name: 'youtube_url', label: 'YouTube (link)', type: 'url' },
  ] },
  { key: 'endereco', label: 'Endereço', fields: [
    { name: 'address', label: 'Endereço' },
    { name: 'city', label: 'Cidade' },
    { name: 'state', label: 'Estado (UF)' },
    { name: 'zip', label: 'CEP' },
    { name: 'maps_url', label: 'Link do Google Maps', type: 'url' },
  ] },
  { key: 'seo', label: 'SEO', fields: [
    { name: 'seo_title', label: 'Meta title', help: 'Até ~60 caracteres.' },
    { name: 'seo_description', label: 'Meta description', type: 'textarea', help: 'Até ~155 caracteres.' },
    { name: 'og_image', label: 'Imagem de compartilhamento (1200×630)', type: 'image' },
  ] },
  { key: 'site', label: 'Site', fields: [
    { name: 'low_seats_threshold', label: 'Alerta de poucas vagas (fração da capacidade)', type: 'number', help: '0.2 = avisar quando restarem 20% das vagas.' },
    { name: 'show_closed_tours', label: 'Mostrar passeios encerrados no site (com selo "Encerrado")', type: 'boolean' },
  ] },
  { key: 'notificacoes', label: 'Notificações', fields: [
    { name: 'notify_email', label: 'E-mail para avisos', type: 'email', help: 'Requer RESEND_API_KEY configurada no servidor.' },
    { name: 'notify_new_booking', label: 'Avisar por e-mail a cada nova reserva', type: 'boolean' },
    { name: 'notify_new_lead', label: 'Avisar por e-mail a cada novo lead', type: 'boolean' },
  ] },
];
