# BK IMPORTS — Arquitetura

## Visão geral

Monólito modular em Next.js 15 (App Router), hospedado na Vercel, com Server
Components e Server Actions como camada de aplicação, Prisma ORM sobre
PostgreSQL (Supabase) como camada de dados, Supabase Auth para autenticação,
Cloudinary para mídia e Mercado Pago para pagamentos (Pix, cartão, boleto).

```
Cliente (Next.js RSC + React + TS + Tailwind + shadcn/ui + Motion)
   -> Server Components / Server Actions (src/modules/*)
   -> Prisma Client (src/lib/prisma.ts)
   -> PostgreSQL (Supabase)

Route Handlers (src/app/api/**) -> Webhooks Mercado Pago, sitemap, robots.txt
```

## Princípios

- **Clean Code / SOLID**: cada módulo de domínio (`src/modules/<dominio>`)
  expõe `actions/`, `queries/`, `schemas/` e `services/` próprios. UI não
  acessa Prisma diretamente — sempre passa pelo módulo.
- **Validação**: toda entrada de Server Action é validada com Zod antes de
  tocar o banco.
- **Autorização em duas camadas**: middleware (`src/middleware.ts`) barra
  acesso não autenticado a `/admin` e `/conta`; cada Server Action
  administrativa revalida a role do usuário antes de mutar dados.
- **Auditoria**: mutações administrativas relevantes gravam `AuditLog`.

## Estrutura de pastas

```
prisma/                 schema.prisma, migrations, seed
src/
  app/
    (storefront)/        vitrine: home, produtos, categorias, carrinho, checkout, conta
    (auth)/               login, cadastro, recuperação de senha
    admin/                painel administrativo (protegido)
    api/                  webhooks e rotas de SEO (sitemap/robots)
  modules/                regras de negócio por domínio
    auth/ catalog/ cart/ checkout/ payments/ orders/
    customers/ inventory/ finance/ marketing/ shipping/ suppliers/
  components/
    ui/                   primitivos shadcn/ui
    storefront/ admin/ shared/
  lib/                    prisma, supabase, cloudinary, mercado-pago, whatsapp
  config/                 constantes do site (site.ts)
  types/ hooks/
docs/                     esta documentação
tests/                    unit, integration, e2e
```

## Identidade visual

Tema escuro por padrão (`.dark` aplicado em `<html>`), paleta preto / branco /
dourado / cinza-escuro definida em `src/app/globals.css` via `@theme` do
Tailwind v4 (tokens `--background`, `--foreground`, `--gold`, etc.). Tipografia:
Inter (texto) + Playfair Display (títulos/display), carregadas via
`next/font/google` em `src/app/layout.tsx`.

## Integrações

| Serviço | Uso | Arquivo |
|---|---|---|
| Supabase Auth | login (email, Google; Apple planejado) | `src/lib/supabase/*` |
| Prisma + Postgres (Supabase) | dados de catálogo, pedidos, etc. | `src/lib/prisma.ts` |
| Cloudinary | upload/entrega de fotos e vídeos de produto | `src/lib/cloudinary.ts` |
| Mercado Pago | Pix, cartão, boleto | `src/lib/mercado-pago.ts` |
| WhatsApp | botão flutuante, pedido via `wa.me` | `src/lib/whatsapp.ts` |

## Decisões técnicas registradas

- **Prisma 7**: usa o gerador `prisma-client` (não `prisma-client-js`), com
  saída em `src/generated/prisma` (ignorado no git, regenerado via
  `postinstall: prisma generate`). Requer driver adapter explícito
  (`@prisma/adapter-pg`) e configuração de datasource em `prisma.config.ts`
  (não mais em `schema.prisma`). Não existe mais campo `directUrl` na
  datasource do `prisma.config.ts`; a conexão direta do Supabase (necessária
  para migrations, já que o pooler não suporta modo sessão) é aplicada via
  override de `DATABASE_URL` nos scripts `db:migrate`/`db:deploy`.
- **Busca de produtos**: Postgres nativo (full-text/`ILIKE`/índices), sem
  dependência de serviço externo — decisão aprovada para o volume inicial.
- **Autenticação social**: Google e e-mail/senha no primeiro momento; Apple
  Sign In entra quando a conta Apple Developer Program estiver disponível.
- **shadcn/ui**: componentes escritos manualmente em `src/components/ui`
  seguindo a convenção oficial, pois o registry remoto (`ui.shadcn.com`) está
  bloqueado pela política de rede deste ambiente.

## Fases de desenvolvimento

Ver o plano completo aprovado no histórico do projeto. Resumo:

0. Fundação (scaffold, tema, Prisma, integrações base) — **em andamento**
1. Auth & Contas
2. Catálogo Base
3. Vitrine & Busca
4. Carrinho & Checkout
5. Pagamentos (Mercado Pago)
6. Pedidos & Rastreio
7. Painel Admin completo
8. Estoque
9. Financeiro
10. Marketing & WhatsApp
11. SEO & Performance
12. QA, testes e deploy
