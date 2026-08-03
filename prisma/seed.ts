import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  "Times Brasileiros",
  "Times Europeus",
  "Seleções",
  "Camisas Retrô",
  "Modelo Torcedor",
  "Modelo Jogador",
  "Infantil",
  "Baby Look",
  "Shorts",
  "Jaquetas",
  "Treino",
  "Agasalhos",
  "Acessórios",
  "Promoções",
  "Lançamentos",
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  for (const [index, name] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: {
        name,
        slug: slugify(name),
        order: index,
      },
    });
  }

  console.log(`Seed concluído: ${CATEGORIES.length} categorias.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
