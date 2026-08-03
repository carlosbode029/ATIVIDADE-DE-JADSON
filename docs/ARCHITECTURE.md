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
- **Auth (Fase 1)**: sessão via cookies (`@supabase/ssr`), sincronização de
  `public.User` feita na aplicação (`modules/auth/services/user-sync.service.ts`),
  chamada após signup por senha, login social e confirmação por e-mail — sem
  trigger de banco. Links de e-mail (confirmação/recuperação) e o retorno do
  OAuth do Google passam por `src/app/auth/confirm` e `src/app/auth/callback`
  respectivamente, que trocam o token por sessão e então sincronizam o
  usuário. Módulo `customers` cuida de perfil e endereços do cliente
  autenticado (`modules/customers`); `auth` cuida apenas de
  identidade/sessão.
- **Admin (Fase 2)**: como o painel de gestão de staff só chega na Fase 7,
  a primeira conta ADMIN é criada com `npm run admin:promote -- email`
  (`prisma/promote-admin.ts`), que atualiza `public.User.role` e sincroniza
  `app_metadata.role` no Supabase (lido pelo middleware). Entidades de
  referência (país, marca, temporada, liga, time) compartilham o mesmo
  componente genérico `EntityFormDialog` (tabela + dialog de criar/editar);
  categorias e produtos têm telas dedicadas por serem mais complexas
  (hierarquia de subcategoria; mídia/variantes/patches/relacionados).
  Upload de imagem/vídeo passa por uma Server Action única
  (`modules/catalog/actions/media.actions.ts`) que envia o arquivo ao
  Cloudinary via `upload_stream`. Ao editar um produto, imagens/vídeos são
  substituídos por completo (sem dependentes no schema), enquanto variantes
  e patches são reconciliados por id — podem estar referenciados em
  `OrderItem`/`CartItem`, então a remoção de um item em uso falha com uma
  mensagem amigável em vez de quebrar a integridade referencial.
- **Vitrine (Fase 3)**: listagem filtrável (`modules/catalog/queries/storefront-product.queries.ts`)
  compartilhada por `/produtos`, `/busca`, `/categorias/[slug]` e
  `/times/[slug]` através do componente `ProductListing` — cada rota só
  define o filtro inicial (categoria/time/busca) e delega o resto. Filtros
  (categoria, time, país, competição, temporada, tamanho) e ordenação vivem
  na URL (`ProductFilters`), então são compartilháveis e voltam ao dar
  refresh. Não existe uma entidade "Jogador" dedicada no schema — a busca
  por jogador é coberta pelo texto livre sobre nome/descrição do produto
  (ex.: um produto chamado "Camisa Argentina I 2026 — Messi" é encontrado
  buscando "Messi"), decisão que evita expandir o modelo de dados sem
  necessidade real ainda. Preços (`Decimal` do Prisma) são convertidos para
  `number` antes de cruzar a fronteira Server → Client Component
  (`ProductCard`/`ProductPurchasePanel` recebem apenas primitivos
  serializáveis). Favoritar é uma Server Action real (`toggleFavorite`) —
  exige login e redireciona para `/login?redirectTo=...` quando anônimo. A
  PDP inclui JSON-LD (`schema.org/Product`) e o CTA principal é "Comprar
  pelo WhatsApp" (monta a mensagem com tamanho/patch/personalização/total),
  já que o carrinho é entregue na Fase 4.

## Fases de desenvolvimento

Ver o plano completo aprovado no histórico do projeto. Resumo:

0. Fundação (scaffold, tema, Prisma, integrações base) — **concluída**
1. Auth & Contas — **concluída**
2. Catálogo Base — **concluída**
3. Vitrine & Busca — **concluída**
4. Carrinho & Checkout
5. Pagamentos (Mercado Pago)
6. Pedidos & Rastreio
7. Painel Admin completo
8. Estoque
9. Financeiro
10. Marketing & WhatsApp
11. SEO & Performance
12. QA, testes e deploy
