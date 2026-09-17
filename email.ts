/**
 * Avisos por e-mail via Resend (https://resend.com).
 * Fica inativo enquanto RESEND_API_KEY não estiver configurada.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return { sent: false as const, reason: 'não configurado' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'Aventure Turismo <onboarding@resend.dev>', to, subject, html }),
    });
    return { sent: res.ok as boolean };
  } catch (e) {
    console.error('[email]', e);
    return { sent: false as const };
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
