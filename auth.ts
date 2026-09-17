import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/env';
import type { Permission } from './permissions';
import type { StaffUser } from './types';

/** Usuário da equipe logado e ativo, com suas permissões (lidas do banco). */
export const getCurrentStaff = cache(async (): Promise<StaffUser | null> => {
  if (!isSupabaseConfigured) return null;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb
    .from('profiles')
    .select('id, full_name, email, role, active, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || !profile.active) return null;
  const { data: perms } = await sb.from('role_permissions').select('permission').eq('role', profile.role);
  return { ...profile, permissions: (perms ?? []).map((p) => p.permission) } as StaffUser;
});

export async function requireStaff() {
  const staff = await getCurrentStaff();
  if (!staff) redirect('/admin/login');
  return staff;
}

/** Para páginas: redireciona se não houver permissão. */
export async function requirePermission(permission: Permission) {
  const staff = await requireStaff();
  if (!staff.permissions.includes(permission)) redirect('/admin?acesso=negado');
  return staff;
}

export class ActionError extends Error {}

/** Para server actions: lança erro se não houver permissão. */
export async function assertPermission(permission: Permission) {
  const staff = await getCurrentStaff();
  if (!staff) throw new ActionError('Sua sessão expirou. Entre novamente.');
  if (!staff.permissions.includes(permission)) throw new ActionError('Você não tem permissão para esta ação.');
  const sb = await createClient();
  return { staff, sb };
}

export const can = (staff: StaffUser | null, p: Permission) => !!staff?.permissions.includes(p);
