# Aventure Turismo — Plataforma completa

Site público + painel administrativo (CRM, reservas, controle de vagas, leads, CMS, relatórios)
para a **Aventure Turismo** — Barreirinhas/MA · Lençóis Maranhenses.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage, RLS) · Recharts · Zod.

---

## ⚡ Publicação rápida (banco já instalado)

O banco já está instalado no projeto Supabase **Viagens** (`yrgprbuimsnwcdmkdaae`), com passeios, destinos, galeria, FAQ,
permissões e configurações. O arquivo `.env.production` já aponta para ele, então **não é preciso configurar variáveis na Vercel**.

**Pelo computador (mais rápido):**
```bash
cd aventure-turismo
npm install
npx vercel --prod      # entre com a sua conta Vercel e aceite as opções padrão
```

**Pelo GitHub:** crie um repositório, envie todos os arquivos desta pasta e, na Vercel, use *Add New → Project → Import*.
Cada `git push` publica de novo automaticamente.

**Depois de publicar:**
1. Supabase → *Authentication → Users → Add user*: crie o seu usuário com e-mail e senha. O primeiro usuário vira **Administrador**.
2. Supabase → *Authentication → URL Configuration*: *Site URL* = endereço do site; *Redirect URLs* = `https://SEU-ENDERECO/auth/callback`.
3. Se o endereço final não for `https://aventure-turismo.vercel.app`, ajuste `NEXT_PUBLIC_SITE_URL` em `.env.production`.
4. (Opcional) Para convidar a equipe por e-mail, cadastre `SUPABASE_SERVICE_ROLE_KEY` em Vercel → *Settings → Environment Variables*.

---

## 1. O que está incluído

**Site público** — início (hero, busca, passeios, experiências, sobre, benefícios, depoimentos, galeria, Instagram, FAQ, CTA),
lista de passeios com filtros, página individual com galeria, roteiro, datas e **vagas em tempo real**, reserva online
(gera código `AVT-AAMM-NNNN`) e botão de WhatsApp, destinos, sobre, galeria, depoimentos, FAQ, contato, privacidade e termos.
SEO completo (metadata, Open Graph, JSON-LD, sitemap, robots), responsivo mobile-first.

**Painel `/admin`** — login e recuperação de senha, dashboard com gráficos, passeios (rascunho/publicar, status que muda o site na hora,
duplicar, destacar, arquivar), horários e vagas (inclusive criação em lote), calendário mensal, reservas (status, pagamentos,
passageiros, histórico, mensagens prontas de WhatsApp), clientes (CRM com histórico de contatos), leads em Kanban (arrastar e soltar,
converter em reserva), destinos, galeria, depoimentos, FAQ, banners com período, biblioteca de mídia (upload com conversão para WebP),
editor do site com rascunho/publicação, ideias, relatórios com exportação CSV, notificações, usuários e permissões, auditoria e configurações.

**Segurança** — permissões verificadas no servidor **e** no banco (Row Level Security em todas as tabelas); o público só acessa
funções específicas (`request_booking`, `submit_lead`); controle de capacidade feito no banco (impossível vender além da vaga);
primeiro usuário vira administrador, os demais nascem inativos; honeypot e limite de envios nos formulários; cabeçalhos de segurança;
painel fora do Google (`noindex`).

**Regra de vagas:** `disponíveis = capacidade − ocupadas manualmente − reservas confirmadas/aguardando pagamento/pagas/concluídas`.
Reservas *pendentes* não ocupam vaga até a equipe confirmar.

---

## 2. Instalação (Supabase)

1. Crie um projeto em https://supabase.com (região São Paulo).
2. Em **SQL Editor**, execute **nesta ordem**:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_functions.sql`
   - `supabase/migrations/0003_policies.sql`
   *(no projeto Viagens isso já foi feito)*
   - `supabase/seed.sql` (categorias, 4 passeios, destinos, fotos, FAQ e dados reais da empresa)
   - *(opcional, só para testar)* `supabase/seed_demo_optional.sql` — cria horários fictícios. Apague-os antes de divulgar o site.
3. Em **Authentication → URL Configuration**:
   - *Site URL*: `https://seu-dominio.com.br`
   - *Redirect URLs*: `https://seu-dominio.com.br/auth/callback`
4. Em **Authentication → Providers → Email**: deixe o login por e-mail ativo. Recomendado desativar *“Allow new users to sign up”*.
5. **Primeiro acesso:** em *Authentication → Users → Add user*, crie o usuário do administrador (com senha).
   O **primeiro usuário criado vira Administrador automaticamente**. Os próximos devem ser convidados pelo painel (Usuários).
6. Para convites por e-mail chegarem com a sua marca, configure um SMTP em *Authentication → Emails* (ex.: Resend).

## 3. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha URL e chaves do Supabase
npm run dev                  # http://localhost:3000  ·  painel em /admin
```

## 4. Publicar (Vercel)

1. Envie a pasta para um repositório no GitHub.
2. Na Vercel, *Add New → Project* e importe o repositório (framework detectado: Next.js).
3. Cadastre as variáveis de ambiente de `.env.example` (as três do Supabase e `NEXT_PUBLIC_SITE_URL`).
4. Deploy. Depois aponte o domínio em *Settings → Domains*.

| Variável | Obrigatória | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | chave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | para convites | **somente no servidor**, nunca exponha |
| `NEXT_PUBLIC_SITE_URL` | sim | sitemap, Open Graph e links de e-mail |
| `RESEND_API_KEY`, `EMAIL_FROM` | não | aviso por e-mail de nova reserva/lead |
| `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | não | envio automático (futuro) |
| `INSTAGRAM_ACCESS_TOKEN` | não | feed automático (futuro) |

---

## 5. O que a Aventure precisa preencher no painel

Nada foi inventado. Os itens abaixo estão como **“Conteúdo demonstrativo”** ou **“[A definir]”** e devem ser revisados:

- **Passeios:** preço (vazio = “Consulte valores”), duração, horários de saída, ponto de encontro, roteiro, incluso/não incluso.
  Depois desmarque *Conteúdo demonstrativo*.
- **Datas e vagas:** cadastre em *Passeios → (passeio) → Datas, horários e vagas* ou use *Criar em lote*.
- **Configurações:** e-mail, telefone fixo, endereço, link do Google Maps, horário de atendimento, e-mail para avisos.
- **Depoimentos:** cadastre apenas avaliações reais de clientes (a seção fica oculta enquanto estiver vazia).
- **Destinos:** revise os textos.
- **Privacidade e termos:** revise com o responsável jurídico (*Conteúdo do site → Privacidade e termos*).

Já configurado com dados reais do Instagram: WhatsApp **(98) 99239-6818**, Instagram **@aventure_turismo**, Barreirinhas - MA,
logotipo oficial (sem alterações) e as fotos enviadas, otimizadas em WebP.

## 6. Perfis de acesso

| Perfil | Padrão |
|---|---|
| Administrador | acesso total |
| Gerente | dashboard, passeios e vagas, destinos, reservas, clientes, leads, relatórios e notificações |
| Atendente | dashboard, visualizar passeios, reservas, clientes, leads e notificações |

As permissões de Gerente e Atendente podem ser ajustadas em *Usuários → Permissões por perfil*.

## 7. Estrutura

```
supabase/          migrações SQL, políticas RLS e dados iniciais
public/            logotipo, ícones e fotos otimizadas
src/app/(site)     páginas públicas
src/app/admin      painel (auth) e (panel)
src/actions        server actions (validação com Zod + checagem de permissão + auditoria)
src/components     ui (design system), site, admin
src/lib            supabase, dados públicos, permissões, formatação, CMS, integrações
```

## 8. Manutenção

- Toda alteração relevante fica registrada em **Auditoria** (quem, o quê, quando).
- Backups: ative *Point in Time Recovery* ou os backups diários do Supabase.
- Para trocar fotos do site: *Mídia* → enviar → escolher no campo de imagem desejado.
- Mensagens de WhatsApp: padrão em *Configurações*; por passeio no próprio passeio (`{passeio}` insere o nome).

---
Site desenvolvido por **@jonsousax** — https://www.instagram.com/jonsousax
