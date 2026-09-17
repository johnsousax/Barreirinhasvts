export const PERMISSIONS = [
  'dashboard.view', 'tours.view', 'tours.manage', 'destinations.manage', 'bookings.manage',
  'customers.manage', 'leads.manage', 'reports.view', 'content.manage', 'ideas.manage',
  'notifications.view', 'settings.manage', 'users.manage', 'audit.view',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', gerente: 'Gerente', atendente: 'Atendente' };
