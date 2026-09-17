import { ZodError } from 'zod';
import { ActionError } from './auth';

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const DB_MESSAGES: [RegExp, string][] = [
  [/CAPACIDADE_EXCEDIDA: (.*)/, 'Capacidade excedida: $1.'],
  [/duplicate key.*slug/i, 'Já existe um item com este endereço (slug). Escolha outro.'],
  [/duplicate key.*uq_schedule_slot/i, 'Já existe um horário nesta data e hora para este passeio.'],
  [/duplicate key/i, 'Registro duplicado.'],
  [/violates foreign key.*bookings/i, 'Não é possível excluir: existem reservas vinculadas. Arquive em vez de excluir.'],
  [/violates foreign key/i, 'Não é possível excluir: existem registros vinculados.'],
  [/row-level security/i, 'Você não tem permissão para esta ação.'],
];

export function dbMessage(message: string) {
  for (const [re, msg] of DB_MESSAGES) if (re.test(message)) return message.replace(re, msg).replace(/^.*?(Capacidade)/, '$1');
  return message;
}

/** Envolve uma action: valida, trata erros e devolve mensagem amigável. */
export async function run<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of err.issues) fieldErrors[issue.path.join('.')] ??= issue.message;
      return { ok: false, error: 'Revise os campos destacados.', fieldErrors };
    }
    if (err instanceof ActionError) return { ok: false, error: err.message };
    if (err && typeof err === 'object' && 'digest' in err) throw err; // redirect/notFound
    const message = err instanceof Error ? err.message : String(err);
    console.error('[action]', message);
    return { ok: false, error: dbMessage(message) };
  }
}

/** Lança erro amigável se a resposta do Supabase tiver erro. */
export function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new ActionError(dbMessage(res.error.message));
  return res.data;
}
