import { PrismaPg } from "@prisma/adapter-pg";

import { createAdminClient } from "../src/lib/supabase/admin";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Promove um usuário já cadastrado a ADMIN. Uso único de bootstrap — a
 * gestão de staff pela UI (Fase 7) substitui este script no dia a dia.
 *
 *   npm run admin:promote -- email@dominio.com
 */
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npm run admin:promote -- email@dominio.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(
      `Nenhum usuário com e-mail "${email}" encontrado. Ele precisa ter feito login/cadastro pelo menos uma vez.`,
    );
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN },
  });

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(
    user.supabaseUserId,
    { app_metadata: { role: Role.ADMIN } },
  );

  if (error) {
    throw error;
  }

  console.log(`${email} agora é ADMIN.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
