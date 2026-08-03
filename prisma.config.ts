import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Conexão usada pelo Prisma Client e pelo Schema Engine (migrations).
    // Os scripts `db:migrate`/`db:deploy` sobrescrevem DATABASE_URL com
    // DIRECT_URL na própria invocação, pois o pooler (PgBouncer) do Supabase
    // não suporta o modo de sessão exigido pelas migrations.
    url: env("DATABASE_URL"),
  },
});
