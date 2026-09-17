import { whatsappUrl } from '../whatsapp';

/**
 * Ponto de integração do WhatsApp.
 * HOJE: o site usa links wa.me (LinkProvider) — funciona sem API.
 * FUTURO: para envio automático, configure WHATSAPP_CLOUD_TOKEN e
 * WHATSAPP_PHONE_NUMBER_ID (WhatsApp Business Cloud API da Meta) e
 * cadastre templates aprovados. Nada é enviado sem essas variáveis.
 */
export interface WhatsAppProvider {
  readonly name: string;
  readonly canSend: boolean;
  link(number: string, message: string): string;
  sendTemplate?(to: string, template: string, params: string[]): Promise<{ ok: boolean; error?: string }>;
}

class LinkProvider implements WhatsAppProvider {
  name = 'wa.me';
  canSend = false;
  link(number: string, message: string) { return whatsappUrl(number, message); }
}

class CloudApiProvider extends LinkProvider {
  name = 'WhatsApp Cloud API';
  canSend = true;
  constructor(private token: string, private phoneId: string) { super(); }
  async sendTemplate(to: string, template: string, params: string[]) {
    // TODO(integração): validar templates aprovados no Meta Business Manager antes de usar.
    const res = await fetch(`https://graph.facebook.com/v21.0/${this.phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to, type: 'template',
        template: { name: template, language: { code: 'pt_BR' }, components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] },
      }),
    });
    return res.ok ? { ok: true } : { ok: false, error: await res.text() };
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return token && phoneId ? new CloudApiProvider(token, phoneId) : new LinkProvider();
}
