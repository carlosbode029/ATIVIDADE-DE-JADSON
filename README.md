# BK IMPORTS

Loja premium de camisas de futebol — Next.js 15, TypeScript, Tailwind CSS,
shadcn/ui, Prisma/Supabase e Mercado Pago.

Documentação completa em [`docs/`](./docs):

- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitetura, estrutura de
  pastas e decisões técnicas.
- [`DATABASE.md`](./docs/DATABASE.md) — modelo de dados.
- [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — variáveis de ambiente e deploy.

## Como rodar localmente

```bash
cp .env.example .env      # preencha com suas credenciais
npm install
npm run db:migrate        # cria as tabelas no banco configurado
npm run db:seed           # popula categorias, países, ligas, marcas e times
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para acessar o painel administrativo (`/admin`), cadastre-se normalmente pela
loja e depois promova sua conta:

```bash
npm run admin:promote -- seu-email@dominio.com
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:migrate` | Cria/aplica migration (dev) |
| `npm run db:deploy` | Aplica migrations (produção) |
| `npm run db:seed` | Popula dados iniciais |
| `npm run db:studio` | Prisma Studio |
| `npm run admin:promote -- email@dominio.com` | Promove um usuário a ADMIN |
