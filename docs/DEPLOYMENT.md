# BK IMPORTS — Deploy

## Pré-requisitos

1. Projeto Supabase criado (Postgres + Auth).
2. Conta Cloudinary (plano com suporte a vídeo).
3. Conta Mercado Pago (credenciais de produção) com Pix, cartão e boleto
   habilitados.
4. Projeto Vercel conectado ao repositório.

## Variáveis de ambiente

Configurar no Vercel (Project Settings → Environment Variables) todas as
chaves listadas em `.env.example`:

- `DATABASE_URL` — connection string **pooled** do Supabase (porta 6543,
  `?pgbouncer=true`), usada pelo Prisma Client em runtime.
- `DIRECT_URL` — connection string **direta** do Supabase (porta 5432).
  Os scripts `db:migrate`/`db:deploy` sobrescrevem `DATABASE_URL` com este
  valor apenas durante a execução das migrations (o pooler não suporta o
  modo sessão exigido pelo Schema Engine).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- `NEXT_PUBLIC_SITE_URL` — domínio final de produção.

## Build

- `postinstall` já roda `prisma generate` automaticamente após `npm install`.
- Antes do primeiro deploy, aplicar as migrations no banco de produção:
  ```bash
  npm run db:deploy
  npm run db:seed
  ```
- Build de produção: `npm run build` (padrão da Vercel).

## Autenticação social

- **Google**: configurar OAuth no Supabase Auth (Dashboard → Authentication →
  Providers) com Client ID/Secret do Google Cloud Console; adicionar a URL de
  callback do Supabase nas origens autorizadas do Google.
- **Apple**: requer Apple Developer Program (conta paga) para gerar o Services
  ID, Key e Team ID exigidos pelo Supabase. Ativar quando a conta estiver
  disponível — o restante do fluxo de auth já está preparado para múltiplos
  provedores.

## Webhooks Mercado Pago

Configurar a URL `https://<dominio>/api/webhooks/mercado-pago` no painel do
Mercado Pago para notificações de pagamento (Pix, cartão, boleto).

## Domínio e SEO

- Apontar o domínio customizado na Vercel.
- Validar `NEXT_PUBLIC_SITE_URL` (usado em metadata, sitemap e Open Graph).
- Enviar `sitemap.xml` ao Google Search Console após o primeiro deploy com
  produtos publicados.
