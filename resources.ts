import type { Permission } from './permissions';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'date' | 'datetime' | 'image' | 'rating' | 'url' | 'slug';
export type OptionSource = 'tours' | 'destinations';

export interface FieldDef {
  name: string; label: string; type: FieldType; required?: boolean; help?: string; placeholder?: string;
  options?: { value: string; label: string }[]; optionsFrom?: OptionSource; full?: boolean; slugFrom?: string;
}
export interface ColumnDef { name: string; label: string; kind?: 'image' | 'badge' | 'bool' | 'date' | 'rating' | 'text' | 'relation'; badge?: Record<string, { label: string; tone: string }>; hideMobile?: boolean }

export interface ResourceDef {
  key: string; table: string; title: string; singular: string; description: string;
  permission: Permission; fields: FieldDef[]; columns: ColumnDef[];
  select: string; orderBy: { column: string; ascending: boolean }[];
  searchColumns: string[]; toggles: { name: string; label: string; onLabel: string; offLabel: string }[];
  filter?: { name: string; label: string; options: { value: string; label: string }[] };
  revalidate: string[]; labelField: string; emptyText: string; placeholderFlag?: string;
}

const GALLERY_CATEGORIES = ['Lençóis', 'Lagoas', 'Quadriciclo', 'Clientes', 'Experiências', 'Pôr do sol', 'Barreirinhas'].map((c) => ({ value: c, label: c }));
const PUB = [{ value: 'publicado', label: 'Publicado' }, { value: 'rascunho', label: 'Rascunho' }, { value: 'arquivado', label: 'Arquivado' }];
const PUB_BADGE = { publicado: { label: 'Publicado', tone: 'green' }, rascunho: { label: 'Rascunho', tone: 'amber' }, arquivado: { label: 'Arquivado', tone: 'gray' } };
const IDEA_STATUS = [
  { value: 'ideia', label: 'Ideia' }, { value: 'planejada', label: 'Planejada' }, { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' }, { value: 'arquivada', label: 'Arquivada' },
];
const IDEA_CATEGORIES = ['Novo passeio', 'Campanha', 'Instagram', 'Promoção', 'Novo destino', 'Melhoria', 'Parceria', 'Evento', 'Roteiro', 'Experiência', 'Outros']
  .map((c) => ({ value: c, label: c }));

export const RESOURCES: Record<string, ResourceDef> = {
  destinos: {
    key: 'destinos', table: 'destinations', title: 'Destinos', singular: 'destino',
    description: 'Lugares atendidos pela Aventure. Cada destino ganha uma página no site.',
    permission: 'destinations.manage',
    select: '*', orderBy: [{ column: 'sort_order', ascending: true }, { column: 'name', ascending: true }],
    searchColumns: ['name', 'location'], labelField: 'name', placeholderFlag: 'is_placeholder',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'slug', label: 'Endereço (slug)', type: 'slug', slugFrom: 'name', help: 'Gerado a partir do nome se ficar vazio.' },
      { name: 'location', label: 'Localização', type: 'text', placeholder: 'Barreirinhas - MA' },
      { name: 'short_description', label: 'Resumo', type: 'textarea', full: true },
      { name: 'description', label: 'Descrição', type: 'textarea', full: true },
      { name: 'image_url', label: 'Imagem', type: 'image', full: true },
      { name: 'status', label: 'Status', type: 'select', options: PUB, required: true },
      { name: 'sort_order', label: 'Ordem', type: 'number' },
      { name: 'is_placeholder', label: 'Conteúdo demonstrativo', type: 'boolean', help: 'Desmarque depois de revisar o texto.' },
    ],
    columns: [
      { name: 'image_url', label: '', kind: 'image' }, { name: 'name', label: 'Destino' },
      { name: 'location', label: 'Local', hideMobile: true }, { name: 'status', label: 'Status', kind: 'badge', badge: PUB_BADGE },
    ],
    toggles: [], revalidate: ['/', '/destinos'], emptyText: 'Nenhum destino cadastrado.',
    filter: { name: 'status', label: 'Status', options: PUB },
  },
  depoimentos: {
    key: 'depoimentos', table: 'reviews', title: 'Depoimentos', singular: 'depoimento',
    description: 'Avaliações reais de clientes. Destaque as melhores para a página inicial.',
    permission: 'content.manage',
    select: '*, tour:tours(name)', orderBy: [{ column: 'featured', ascending: false }, { column: 'sort_order', ascending: true }, { column: 'created_at', ascending: false }],
    searchColumns: ['author_name', 'comment'], labelField: 'author_name',
    fields: [
      { name: 'author_name', label: 'Nome do cliente', type: 'text', required: true },
      { name: 'author_city', label: 'Cidade', type: 'text' },
      { name: 'rating', label: 'Nota', type: 'rating', required: true },
      { name: 'review_date', label: 'Data', type: 'date' },
      { name: 'comment', label: 'Comentário', type: 'textarea', required: true, full: true },
      { name: 'tour_id', label: 'Passeio relacionado', type: 'select', optionsFrom: 'tours' },
      { name: 'author_photo_url', label: 'Foto (opcional)', type: 'image', full: true },
      { name: 'visible', label: 'Visível no site', type: 'boolean' },
      { name: 'featured', label: 'Destacar na página inicial', type: 'boolean' },
      { name: 'sort_order', label: 'Ordem', type: 'number' },
    ],
    columns: [
      { name: 'author_photo_url', label: '', kind: 'image' }, { name: 'author_name', label: 'Cliente' },
      { name: 'rating', label: 'Nota', kind: 'rating' }, { name: 'tour', label: 'Passeio', kind: 'relation', hideMobile: true },
      { name: 'review_date', label: 'Data', kind: 'date', hideMobile: true },
    ],
    toggles: [
      { name: 'visible', label: 'Visibilidade', onLabel: 'Visível', offLabel: 'Oculto' },
      { name: 'featured', label: 'Destaque', onLabel: 'Destacado', offLabel: 'Normal' },
    ],
    revalidate: ['/', '/depoimentos'], emptyText: 'Nenhum depoimento ainda. Adicione avaliações reais dos seus clientes.',
  },
  galeria: {
    key: 'galeria', table: 'gallery', title: 'Galeria', singular: 'foto',
    description: 'Fotos exibidas na galeria do site, organizadas por categoria.',
    permission: 'content.manage',
    select: '*', orderBy: [{ column: 'featured', ascending: false }, { column: 'sort_order', ascending: true }],
    searchColumns: ['title', 'category'], labelField: 'title',
    fields: [
      { name: 'image_url', label: 'Foto', type: 'image', required: true, full: true },
      { name: 'title', label: 'Descrição (texto alternativo)', type: 'text', full: true },
      { name: 'category', label: 'Categoria', type: 'select', options: GALLERY_CATEGORIES, required: true },
      { name: 'sort_order', label: 'Ordem', type: 'number' },
      { name: 'visible', label: 'Visível no site', type: 'boolean' },
      { name: 'featured', label: 'Destaque (aparece maior)', type: 'boolean' },
    ],
    columns: [
      { name: 'image_url', label: '', kind: 'image' }, { name: 'title', label: 'Descrição' },
      { name: 'category', label: 'Categoria', hideMobile: true },
    ],
    toggles: [
      { name: 'visible', label: 'Visibilidade', onLabel: 'Visível', offLabel: 'Oculta' },
      { name: 'featured', label: 'Destaque', onLabel: 'Destacada', offLabel: 'Normal' },
    ],
    filter: { name: 'category', label: 'Categoria', options: GALLERY_CATEGORIES },
    revalidate: ['/', '/galeria'], emptyText: 'A galeria está vazia. Envie a primeira foto.',
  },
  faq: {
    key: 'faq', table: 'faqs', title: 'Perguntas frequentes', singular: 'pergunta',
    description: 'Perguntas e respostas exibidas no site.',
    permission: 'content.manage',
    select: '*', orderBy: [{ column: 'sort_order', ascending: true }],
    searchColumns: ['question', 'answer'], labelField: 'question',
    fields: [
      { name: 'question', label: 'Pergunta', type: 'text', required: true, full: true },
      { name: 'answer', label: 'Resposta', type: 'textarea', required: true, full: true },
      { name: 'sort_order', label: 'Ordem', type: 'number' },
      { name: 'visible', label: 'Visível no site', type: 'boolean' },
    ],
    columns: [{ name: 'question', label: 'Pergunta' }, { name: 'sort_order', label: 'Ordem', hideMobile: true }],
    toggles: [{ name: 'visible', label: 'Visibilidade', onLabel: 'Visível', offLabel: 'Oculta' }],
    revalidate: ['/', '/faq'], emptyText: 'Nenhuma pergunta cadastrada.',
  },
  banners: {
    key: 'banners', table: 'banners', title: 'Banners e campanhas', singular: 'banner',
    description: 'Faixas promocionais com período de exibição. Ativas só dentro das datas definidas.',
    permission: 'content.manage',
    select: '*', orderBy: [{ column: 'active', ascending: false }, { column: 'sort_order', ascending: true }, { column: 'created_at', ascending: false }],
    searchColumns: ['title', 'subtitle'], labelField: 'title',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', full: true },
      { name: 'image_url', label: 'Imagem', type: 'image', full: true },
      { name: 'button_label', label: 'Texto do botão', type: 'text' },
      { name: 'button_url', label: 'Link do botão', type: 'text', placeholder: '/passeios/lagoa-azul' },
      { name: 'placement', label: 'Posição', type: 'select', required: true, options: [
        { value: 'home_topo', label: 'Início — abaixo do topo' }, { value: 'home_meio', label: 'Início — meio da página' }, { value: 'passeios', label: 'Página de passeios' },
      ] },
      { name: 'sort_order', label: 'Ordem', type: 'number' },
      { name: 'starts_at', label: 'Início', type: 'datetime' },
      { name: 'ends_at', label: 'Fim', type: 'datetime' },
      { name: 'active', label: 'Ativo', type: 'boolean' },
    ],
    columns: [
      { name: 'image_url', label: '', kind: 'image' }, { name: 'title', label: 'Banner' },
      { name: 'starts_at', label: 'Início', kind: 'date', hideMobile: true }, { name: 'ends_at', label: 'Fim', kind: 'date', hideMobile: true },
    ],
    toggles: [{ name: 'active', label: 'Status', onLabel: 'Ativo', offLabel: 'Inativo' }],
    revalidate: ['/', '/passeios'], emptyText: 'Nenhum banner. Crie uma campanha para destacar uma promoção.',
  },
  ideias: {
    key: 'ideias', table: 'ideas', title: 'Ideias', singular: 'ideia',
    description: 'Novos passeios, campanhas, conteúdos e parcerias para não esquecer.',
    permission: 'ideas.manage',
    select: '*', orderBy: [{ column: 'status', ascending: true }, { column: 'priority', ascending: false }, { column: 'created_at', ascending: false }],
    searchColumns: ['title', 'description', 'owner'], labelField: 'title',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'description', label: 'Descrição', type: 'textarea', full: true },
      { name: 'category', label: 'Categoria', type: 'select', options: IDEA_CATEGORIES, required: true },
      { name: 'priority', label: 'Prioridade', type: 'select', required: true, options: [{ value: 'baixa', label: 'Baixa' }, { value: 'media', label: 'Média' }, { value: 'alta', label: 'Alta' }] },
      { name: 'status', label: 'Status', type: 'select', options: IDEA_STATUS, required: true },
      { name: 'due_date', label: 'Data', type: 'date' },
      { name: 'owner', label: 'Responsável', type: 'text' },
      { name: 'notes', label: 'Observações', type: 'textarea', full: true },
    ],
    columns: [
      { name: 'title', label: 'Ideia' }, { name: 'category', label: 'Categoria', hideMobile: true },
      { name: 'priority', label: 'Prioridade', kind: 'badge', badge: { alta: { label: 'Alta', tone: 'red' }, media: { label: 'Média', tone: 'amber' }, baixa: { label: 'Baixa', tone: 'gray' } } },
      { name: 'status', label: 'Status', kind: 'badge', badge: { ideia: { label: 'Ideia', tone: 'blue' }, planejada: { label: 'Planejada', tone: 'navy' }, em_andamento: { label: 'Em andamento', tone: 'amber' }, concluida: { label: 'Concluída', tone: 'green' }, arquivada: { label: 'Arquivada', tone: 'gray' } } },
      { name: 'owner', label: 'Responsável', hideMobile: true },
    ],
    toggles: [], filter: { name: 'status', label: 'Status', options: IDEA_STATUS },
    revalidate: [], emptyText: 'Nenhuma ideia registrada. Anote a primeira.',
  },
};
