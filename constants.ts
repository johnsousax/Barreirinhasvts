export const SOURCES = [
  { value: 'site', label: 'Site' }, { value: 'reserva_site', label: 'Reserva pelo site' }, { value: 'formulario_contato', label: 'Formulário de contato' }, { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' }, { value: 'indicacao', label: 'Indicação' }, { value: 'trafego_pago', label: 'Tráfego pago' },
  { value: 'presencial', label: 'Presencial' }, { value: 'parceiro', label: 'Parceiro / pousada' }, { value: 'outro', label: 'Outro' },
];
export const sourceLabel = (v: string | null | undefined) => SOURCES.find((s) => s.value === v)?.label ?? v ?? '—';

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' }, { value: 'cartao', label: 'Cartão' }, { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' }, { value: 'outro', label: 'Outro' },
];
export const PAYMENT_STATUS: Record<string, { label: string; tone: string }> = {
  pendente: { label: 'Pendente', tone: 'amber' }, pago: { label: 'Pago', tone: 'green' },
  estornado: { label: 'Estornado', tone: 'gray' }, cancelado: { label: 'Cancelado', tone: 'red' },
};
export const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' }, { value: 'ligacao', label: 'Ligação' }, { value: 'email', label: 'E-mail' },
  { value: 'presencial', label: 'Presencial' }, { value: 'instagram', label: 'Instagram' }, { value: 'nota', label: 'Anotação' },
];

export const PERMISSION_LABEL: Record<string, string> = {
  'dashboard.view': 'Ver dashboard', 'tours.view': 'Ver passeios e calendário', 'tours.manage': 'Editar passeios, horários e vagas',
  'destinations.manage': 'Gerenciar destinos', 'bookings.manage': 'Gerenciar reservas', 'customers.manage': 'Gerenciar clientes',
  'leads.manage': 'Gerenciar leads', 'reports.view': 'Ver relatórios', 'content.manage': 'Editar conteúdo do site, galeria e mídia',
  'ideas.manage': 'Gerenciar ideias', 'notifications.view': 'Receber notificações', 'settings.manage': 'Alterar configurações',
  'users.manage': 'Gerenciar usuários e permissões', 'audit.view': 'Ver auditoria',
};
