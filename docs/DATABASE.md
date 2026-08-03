# BK IMPORTS — Modelo de Dados

Fonte da verdade: `prisma/schema.prisma`. Este documento resume as entidades e
como elas se relacionam.

## Contas

- **User** — sincronizado com `auth.users` do Supabase via `supabaseUserId`.
  `role` (`CUSTOMER`, `STAFF`, `ADMIN`) controla acesso ao painel admin.
- **Address** — endereços do usuário; usado como endereço de entrega do
  `Order`.

## Catálogo

- **Country**, **League**, **Team** (N:N com League via `TeamLeague`),
  **Season**, **Brand**, **Category** (auto-relacionamento para
  subcategoria via `parentId`).
- **Product** — entidade central. Relaciona-se com `Category`
  (categoria/subcategoria), `Brand`, `Season`, `League`, `Country`, `Team`.
  Preço em `Decimal(10,2)`; flags de personalização
  (`allowsCustomName`, `allowsCustomNumber`, `allowsPatch`); campos de SEO
  (`metaTitle`, `metaDescription`).
- **ProductImage**, **ProductVideo** — mídia ilimitada (Cloudinary), ordenável.
- **ProductVariant** — estoque por tamanho (`size` livre, cobre adulto,
  infantil e baby look), com `sku` próprio e `lowStockThreshold`.
- **ProductPatch** — patches disponíveis (ex.: Champions League) com preço
  adicional.
- **RelatedProduct** — auto-relacionamento N:N para produtos relacionados.
- **Favorite**, **Review** — interação do cliente com o produto.

## Carrinho e pedido

- **Cart** / **CartItem** — carrinho por usuário (`userId`) ou visitante
  (`sessionId`); item referencia `ProductVariant` + patch/nome/número
  personalizados opcionais.
- **Coupon** — percentual ou fixo (`DiscountType`), com validade e limite de
  uso.
- **Order** — snapshot financeiro do pedido (`subtotal`, `discount`,
  `shippingCost`, `total`), status (`OrderStatus`), endereço de entrega,
  método de frete/transportadora e código de rastreio.
- **OrderItem** — snapshot imutável do item no momento da compra (nome,
  tamanho, preço, personalização), para não depender de alterações futuras no
  catálogo.
- **Payment** — um ou mais pagamentos por pedido (Mercado Pago), com
  `mpPaymentId` único para idempotência do webhook.

## Logística

- **Carrier** (transportadora) e **ShippingMethod** (frete, com preço base +
  por kg e prazo estimado).

## Estoque

- **StockMovement** — ledger de entradas/saídas/ajustes por
  `ProductVariant`, com autor (`createdBy`) e motivo.

## Marketing

- **Banner**, **Campaign**.
- **Promotion** — N:N com `Product` (`PromotionProduct`) e `Category`
  (`PromotionCategory`).

## Financeiro e fornecedores

- **FinanceEntry** — lançamento de entrada/saída (`FinanceType`), podendo
  referenciar um `Order` (receita automática da venda).
- **Supplier** — cadastro de fornecedores.

## Suporte e auditoria

- **Message** — mensagens do cliente para o suporte.
- **AuditLog** — trilha de auditoria de ações administrativas
  (`action`, `entity`, `entityId`, `metadata`). Toda mutação do painel admin
  (`src/modules/catalog/actions/*`) grava um registro via
  `src/lib/audit-log.ts`.

## Dados de referência (seed)

`prisma/seed.ts` popula, além das 15 categorias da loja, um conjunto inicial
de dados reais de futebol para permitir testar o cadastro de produtos de
ponta a ponta: 8 países, 7 ligas/competições (incluindo a UEFA Champions
League, sem país associado), 6 marcas e 10 times com seus vínculos de
país/liga. Todos com `upsert` idempotente — seguro rodar múltiplas vezes.

## Convenções

- IDs: `cuid()`.
- Valores monetários: `Decimal(10,2)`.
- Sem `@map`/`@@map` explícitos — Prisma referencia os identificadores
  camelCase do schema diretamente no Postgres (identificadores citados
  automaticamente), evitando mapeamento redundante.
- Índices adicionados nas FKs de consulta frequente (`categoryId`, `teamId`,
  `leagueId`, `countryId`, `status` de pedido, etc.).

## Migrations

```bash
npm run db:migrate   # cria e aplica migration em desenvolvimento
npm run db:deploy    # aplica migrations pendentes em produção
npm run db:seed      # popula as categorias principais da loja
npm run db:studio    # Prisma Studio
```

`DATABASE_URL` (pooled, porta 6543) é usada pelo Prisma Client em runtime. O
pooler (PgBouncer) do Supabase não suporta o modo de sessão exigido pelas
migrations, então `npm run db:migrate` e `npm run db:deploy` sobrescrevem
`DATABASE_URL` com `DIRECT_URL` (porta 5432) apenas para aquela invocação —
o Prisma 7 (`prisma.config.ts`) não tem mais um campo `directUrl` na
datasource, por isso o override é feito via variável de ambiente no próprio
script (ver `package.json`).
