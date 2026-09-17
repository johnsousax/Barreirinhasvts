import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './env';

/**
 * Cliente com service role. USO RESTRITO ao servidor e apenas para
 * operações do Auth (convidar/desativar usuários). Nunca importe em
 * componentes client.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.');
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
