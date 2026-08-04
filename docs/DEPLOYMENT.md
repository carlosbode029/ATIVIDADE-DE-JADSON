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

## Autenticação (Supabase Auth)

- **Google**: configurar OAuth no Supabase Auth (Dashboard → Authentication →
  Providers) com Client ID/Secret do Google Cloud Console; adicionar a URL de
  callback do Supabase (`https://[PROJECT_REF].supabase.co/auth/v1/callback`)
  nas origens autorizadas do Google. No Google Cloud Console, autorize também
  a origem `https://<dominio-da-loja>`.
- **Apple**: requer Apple Developer Program (conta paga) para gerar o Services
  ID, Key e Team ID exigidos pelo Supabase. Ativar quando a conta estiver
  disponível — o restante do fluxo de auth já está preparado para múltiplos
  provedores.
- **Redirect URLs**: em Authentication → URL Configuration, adicionar
  `https://<dominio>/auth/callback` (OAuth) e `https://<dominio>/auth/confirm`
  (confirmação de e-mail e recuperação de senha) à lista de Redirect URLs
  permitidas. Sem isso o Supabase rejeita o redirecionamento pós-login.
- **Templates de e-mail** (Authentication → Email Templates): tanto o
  template "Confirm signup" quanto "Reset password" precisam apontar para a
  rota `/auth/confirm` da aplicação, e não para o link padrão do Supabase.
  Substitua o corpo do link por:
  ```
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next={{ .RedirectTo }}
  ```
  A rota `src/app/auth/confirm/route.ts` troca o `token_hash` por uma sessão
  válida (`supabase.auth.verifyOtp`) e redireciona para `next` — que já é
  preenchido pela aplicação (`emailRedirectTo` no cadastro, `redirectTo` na
  recuperação de senha).

## Webhooks Mercado Pago

1. No painel do Mercado Pago, em **Suas integrações > [sua aplicação] >
   Webhooks > Configurar notificações**, cadastre a URL:
   ```
   https://<dominio>/api/webhooks/mercado-pago
   ```
2. Assine o evento **Pagamentos**.
3. Copie a **assinatura secreta** exibida na mesma tela e defina como
   `MERCADO_PAGO_WEBHOOK_SECRET` nas variáveis de ambiente do deploy — ela é
   usada por `src/app/api/webhooks/mercado-pago/route.ts` para validar, via
   HMAC, que a notificação recebida realmente veio do Mercado Pago
   (`WebhookSignatureValidator` do SDK) antes de processar qualquer alteração
   de pedido.
4. O handler é idempotente: reenvios da mesma notificação (comuns no Mercado
   Pago) não duplicam baixa de estoque nem lançamento financeiro — o status
   só é reaplicado se realmente mudou (`src/modules/payments/services/process-payment-update.ts`).
5. Sem webhook configurado, o pagamento ainda pode ser confirmado
   manualmente pelo comprador na página do pedido (botão "verificar
   pagamento", que consulta a API do Mercado Pago sob demanda), mas o
   webhook é o caminho principal em produção.

## Domínio e SEO

- Apontar o domínio customizado na Vercel.
- Validar `NEXT_PUBLIC_SITE_URL` (usado em metadata, sitemap e Open Graph).
- Enviar `sitemap.xml` ao Google Search Console após o primeiro deploy com
  produtos publicados.

## Primeiro administrador

A UI de gestão de equipe (`/admin/equipe`) só existe depois que já existe
pelo menos um `ADMIN` — para o primeiro, use o script de bootstrap:

```bash
npm run admin:promote -- seu@email.com
```

O e-mail precisa já ter feito login/cadastro na loja pelo menos uma vez
(precisa existir em `public.User`). O script promove tanto o Prisma
(`User.role`) quanto o `app_metadata.role` no Supabase, que é o que o
middleware lê para liberar `/admin`. A partir daí, esse admin pode promover
qualquer outra pessoa (ex.: um sócio) direto pela UI em `/admin/equipe`,
sem precisar rodar o script de novo.

## Testes e CI

- `npm test` — testes unitários (funções puras, sem banco), rápidos o
  suficiente para rodar a qualquer momento.
- `npm run test:integration` — exercita fluxos críticos (pagamento,
  status de pedido, estoque, financeiro, promoções) contra um Postgres
  real; requer `DATABASE_URL` apontando para um banco descartável (nunca
  rodar contra produção).
- `npm run test:all` roda os dois juntos.
- `.github/workflows/ci.yml` roda a cada push/PR: sobe um Postgres de
  serviço, aplica migrations, semeia dados de referência, e roda
  typecheck, lint, a suíte de testes completa e o build — com credenciais
  placeholder do Supabase (a build/testes não fazem nenhuma chamada real
  de rede para Supabase/Cloudinary/Mercado Pago, só o schema/lógica local).

## Checklist de lançamento

- [ ] Variáveis de ambiente configuradas na Vercel (seção acima).
- [ ] `npm run db:deploy` aplicado no banco de produção.
- [ ] `npm run db:seed` rodado (categorias, países, ligas, marcas, times,
      transportadora e cupom de referência).
- [ ] Primeiro admin promovido (`npm run admin:promote -- seu@email.com`).
- [ ] Login Google configurado no Supabase Auth + Redirect URLs cadastradas.
- [ ] Templates de e-mail do Supabase apontando para `/auth/confirm`.
- [ ] Webhook do Mercado Pago cadastrado e `MERCADO_PAGO_WEBHOOK_SECRET`
      configurado.
- [ ] Ao menos um produto real cadastrado com estoque, para o catálogo não
      ficar vazio no primeiro acesso.
- [ ] Domínio customizado apontado e `NEXT_PUBLIC_SITE_URL` atualizado.
- [ ] `sitemap.xml` enviado ao Google Search Console.
- [ ] CI verde no commit que será promovido a produção.
