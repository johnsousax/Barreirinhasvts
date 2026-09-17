import type { SupabaseClient } from '@supabase/supabase-js';
import type { StaffUser } from './types';

export async function logAudit(
  sb: SupabaseClient,
  staff: StaffUser,
  entry: { action: string; entity: string; entityId?: string | null; summary: string; changes?: unknown },
) {
  const { error } = await sb.from('audit_logs').insert({
    user_id: staff.id,
    user_name: staff.full_name || staff.email,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    summary: `${staff.full_name || staff.email} ${entry.summary}`,
    changes: entry.changes ?? null,
  });
  if (error) console.error('[audit]', error.message);
}

/** Lista legível das diferenças entre dois objetos (para auditoria). */
export function diff(before: Record<string, unknown> | null, after: Record<string, unknown>) {
  const changes: Record<string, { de: unknown; para: unknown }> = {};
  for (const [k, v] of Object.entries(after)) {
    const old = before?.[k];
    if (JSON.stringify(old ?? null) !== JSON.stringify(v ?? null)) changes[k] = { de: old ?? null, para: v ?? null };
  }
  return changes;
}
