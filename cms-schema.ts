/**
 * Esquema das seções editáveis do site. O editor do painel é gerado a
 * partir daqui, e os valores padrão garantem que o site nunca fique vazio.
 */
export type CmsField =
  | { name: string; label: string; type: 'text' | 'textarea' | 'image' | 'url'; help?: string }
  | { name: string; label: string; type: 'list'; itemLabel: string; fields: { name: string; label: string; type: 'text' | 'textarea' | 'image' | 'icon' }[] }
  | { name: string; label: string; type: 'images'; help?: string };

export interface CmsSection { key: string; label: string; description: string; fields: CmsField[]; defaults: Record<string, unknown> }

export const BENEFIT_ICONS = ['sparkles', 'heart', 'compass', 'users', 'calendar', 'headphones', 'shield', 'sun', 'waves', 'map'] as const;

export const CMS_SECTIONS: CmsSection[] = [
  {
    key: 'hero', label: 'Topo (hero)', description: 'Primeira dobra da página inicial.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { name: 'primary_label', label: 'Botão principal', type: 'text' },
      { name: 'secondary_label', label: 'Botão secundário', type: 'text' },
      { name: 'location_label', label: 'Selo de localização', type: 'text' },
      { name: 'image_url', label: 'Foto de fundo', type: 'image', help: 'Foto horizontal ou quadrada de alta qualidade.' },
    ],
    defaults: {
      title: 'Viva os Lençóis Maranhenses como você nunca viu.',
      subtitle: 'Passeios, experiências e aventuras inesquecíveis em Barreirinhas - MA.',
      primary_label: 'Conhecer passeios',
      secondary_label: 'Reservar agora',
      location_label: 'Barreirinhas, Maranhão',
      image_url: '/images/lagoa-bandeira.webp',
    },
  },
  {
    key: 'tours_section', label: 'Passeios em destaque', description: 'Títulos da vitrine de passeios.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
    ],
    defaults: { title: 'Passeios para viver os Lençóis', subtitle: 'Lagoas, dunas e aventura. Escolha a sua experiência e veja datas e vagas.' },
  },
  {
    key: 'experiences', label: 'Experiências', description: 'Momentos que o cliente vive nos passeios.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { name: 'items', label: 'Experiências', type: 'list', itemLabel: 'Experiência', fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'text', label: 'Frase', type: 'textarea' },
        { name: 'image_url', label: 'Foto', type: 'image' },
      ] },
    ],
    defaults: {
      title: 'Momentos que ficam',
      subtitle: 'Cada passeio tem o seu jeito de ser lembrado.',
      items: [
        { title: 'Banho nas lagoas', text: 'Água cristalina no meio das dunas.', image_url: '/images/lagoa-casal.webp' },
        { title: 'Quadriciclo nas dunas', text: 'Areia, vento e adrenalina na medida.', image_url: '/images/quadriciclo-grupo.webp' },
        { title: 'Pôr do sol', text: 'O céu mudando de cor sobre a areia branca.', image_url: '/images/por-do-sol.webp' },
        { title: 'A dois', text: 'Um roteiro para guardar na memória do casal.', image_url: '/images/casal-lagoa.webp' },
        { title: 'Em família e em grupo', text: 'Todo mundo junto, cada um com a sua foto favorita.', image_url: '/images/familia-lagoa.webp' },
        { title: 'Aventura pelas dunas', text: 'Caminhar até o alto e ver as lagoas lá embaixo.', image_url: '/images/grupo-dunas.webp' },
      ],
    },
  },
  {
    key: 'about', label: 'Sobre nós', description: 'Apresentação da Aventure Turismo.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'text', label: 'Texto', type: 'textarea' },
      { name: 'image_url', label: 'Foto', type: 'image' },
      { name: 'image_url_2', label: 'Foto secundária', type: 'image' },
      { name: 'highlights', label: 'Destaques', type: 'list', itemLabel: 'Destaque', fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'text', label: 'Texto', type: 'textarea' },
      ] },
    ],
    defaults: {
      title: 'Mais do que um passeio. Uma experiência para guardar.',
      text: 'A Aventure Turismo organiza passeios e experiências em Barreirinhas e nos Lençóis Maranhenses. Cuidamos do roteiro, do transporte e do atendimento para que você só se preocupe em aproveitar as lagoas, as dunas e cada momento da viagem.',
      image_url: '/images/grupo-dunas.webp',
      image_url_2: '/images/quadriciclo-casal.webp',
      highlights: [
        { title: 'Atendimento próximo', text: 'Do primeiro contato ao fim do passeio, você fala com a nossa equipe.' },
        { title: 'Segurança', text: 'Roteiros planejados e orientações claras antes de sair.' },
        { title: 'Conhecimento local', text: 'Barreirinhas é a nossa base e os Lençóis, o nosso quintal.' },
        { title: 'Experiências sob medida', text: 'Passeios para casais, famílias e grupos, compartilhados ou privativos.' },
      ],
    },
  },
  {
    key: 'benefits', label: 'Por que a Aventure', description: 'Diferenciais da empresa.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'items', label: 'Diferenciais', type: 'list', itemLabel: 'Diferencial', fields: [
        { name: 'icon', label: 'Ícone', type: 'icon' },
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'text', label: 'Texto', type: 'textarea' },
      ] },
    ],
    defaults: {
      title: 'Por que viajar com a Aventure?',
      items: [
        { icon: 'sparkles', title: 'Experiências inesquecíveis', text: 'Roteiros pensados para os cenários mais bonitos dos Lençóis.' },
        { icon: 'heart', title: 'Atendimento próximo', text: 'Tire dúvidas e ajuste detalhes direto pelo WhatsApp.' },
        { icon: 'compass', title: 'Conhecimento da região', text: 'Equipe que vive Barreirinhas e conhece cada caminho.' },
        { icon: 'users', title: 'Passeios para diferentes perfis', text: 'Casais, famílias, amigos e quem busca aventura.' },
        { icon: 'calendar', title: 'Facilidade para reservar', text: 'Escolha a data, veja as vagas e envie sua solicitação em minutos.' },
        { icon: 'headphones', title: 'Suporte durante a experiência', text: 'Estamos com você antes, durante e depois do passeio.' },
      ],
    },
  },
  {
    key: 'reviews_section', label: 'Depoimentos', description: 'Títulos da seção de avaliações.',
    fields: [{ name: 'title', label: 'Título', type: 'text' }, { name: 'subtitle', label: 'Subtítulo', type: 'textarea' }],
    defaults: { title: 'Quem viajou com a gente', subtitle: 'Relatos de clientes que viveram os Lençóis com a Aventure.' },
  },
  {
    key: 'gallery_section', label: 'Galeria', description: 'Títulos da galeria.',
    fields: [{ name: 'title', label: 'Título', type: 'text' }, { name: 'subtitle', label: 'Subtítulo', type: 'textarea' }],
    defaults: { title: 'Galeria', subtitle: 'Lagoas, dunas, quadriciclo e os nossos clientes em cada passeio.' },
  },
  {
    key: 'instagram', label: 'Instagram', description: 'Seção "Siga nossas aventuras". Sem integração automática: escolha as fotos aqui.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { name: 'images', label: 'Fotos exibidas', type: 'images', help: 'Até 6 fotos. Todas levam ao perfil oficial.' },
    ],
    defaults: {
      title: 'Siga nossas aventuras',
      subtitle: 'Passeios, bastidores e clientes de todo o Brasil no nosso Instagram.',
      images: ['/images/quadriciclo-casal.webp', '/images/lagoa-bandeira.webp', '/images/grupo-bandeira.webp', '/images/casal-dunas.webp', '/images/por-do-sol.webp', '/images/casal-lagoa.webp'],
    },
  },
  {
    key: 'faq_section', label: 'FAQ', description: 'Títulos das perguntas frequentes (as perguntas ficam em Depoimentos & FAQ).',
    fields: [{ name: 'title', label: 'Título', type: 'text' }, { name: 'subtitle', label: 'Subtítulo', type: 'textarea' }],
    defaults: { title: 'Perguntas frequentes', subtitle: 'Não encontrou o que procura? Fale com a gente pelo WhatsApp.' },
  },
  {
    key: 'cta', label: 'Chamada final', description: 'Bloco antes do rodapé.',
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { name: 'primary_label', label: 'Botão principal', type: 'text' },
      { name: 'secondary_label', label: 'Botão WhatsApp', type: 'text' },
      { name: 'image_url', label: 'Foto de fundo', type: 'image' },
    ],
    defaults: {
      title: 'Seu próximo destino começa aqui.',
      subtitle: 'Escolha sua experiência e descubra os Lençóis Maranhenses de um jeito inesquecível.',
      primary_label: 'Ver passeios',
      secondary_label: 'Falar no WhatsApp',
      image_url: '/images/por-do-sol.webp',
    },
  },
  {
    key: 'footer', label: 'Rodapé', description: 'Texto e links úteis do rodapé.',
    fields: [
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'links', label: 'Links úteis', type: 'list', itemLabel: 'Link', fields: [
        { name: 'label', label: 'Texto', type: 'text' },
        { name: 'href', label: 'Endereço', type: 'text' },
      ] },
    ],
    defaults: {
      description: 'Passeios, experiências e emoções nos Lençóis Maranhenses. Saídas de Barreirinhas - MA.',
      links: [
        { label: 'Perguntas frequentes', href: '/faq' },
        { label: 'Fale conosco', href: '/contato' },
        { label: 'Destinos', href: '/destinos' },
      ],
    },
  },
  {
    key: 'contact_page', label: 'Página de contato', description: 'Textos da página /contato.',
    fields: [{ name: 'title', label: 'Título', type: 'text' }, { name: 'text', label: 'Texto', type: 'textarea' }],
    defaults: { title: 'Vamos planejar seu passeio?', text: 'Conte quando você vem e o que quer conhecer. Respondemos pelo WhatsApp ou e-mail.' },
  },
  {
    key: 'legal', label: 'Privacidade e termos', description: 'Textos legais. Revise com um profissional antes de publicar.',
    fields: [
      { name: 'privacy', label: 'Política de privacidade', type: 'textarea', help: 'Parágrafos separados por linha em branco. Linhas começando com "## " viram subtítulos.' },
      { name: 'terms', label: 'Termos de uso', type: 'textarea' },
    ],
    defaults: {
      privacy: '## Quais dados coletamos\nQuando você solicita uma reserva ou envia uma mensagem, coletamos nome, telefone/WhatsApp, e-mail (opcional), data desejada, quantidade de pessoas e observações.\n\n## Para que usamos\nUsamos esses dados apenas para responder ao seu contato, organizar a sua reserva e prestar o atendimento durante o passeio.\n\n## Compartilhamento\nNão vendemos seus dados. Eles podem ser compartilhados somente com parceiros necessários para executar o passeio contratado.\n\n## Seus direitos\nVocê pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelos nossos canais de contato, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).\n\n## Revisão\n[Texto base: revise com um profissional antes de publicar.]',
      terms: '## Solicitação de reserva\nO envio do formulário é uma solicitação. A reserva só é confirmada após o retorno da nossa equipe.\n\n## Valores e pagamento\nValores, formas de pagamento e condições são informados no atendimento antes da confirmação.\n\n## Cancelamentos e remarcações\nAs condições de cancelamento e remarcação são informadas na confirmação da reserva.\n\n## Condições climáticas\nPasseios podem ser ajustados por questões de segurança, clima ou determinações do parque.\n\n## Revisão\n[Texto base: revise com um profissional antes de publicar.]',
    },
  },
];

export const CMS_BY_KEY = Object.fromEntries(CMS_SECTIONS.map((s) => [s.key, s]));

export function withDefaults<T = Record<string, any>>(key: string, content: Record<string, unknown> | null | undefined): T {
  const def = CMS_BY_KEY[key]?.defaults ?? {};
  const out: Record<string, unknown> = { ...def };
  for (const [k, v] of Object.entries(content ?? {})) {
    if (v === null || v === undefined || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}
