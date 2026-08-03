import { PrismaPg } from "@prisma/adapter-pg";

import { slugify } from "../src/lib/slugify";
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

const COUNTRIES = [
  { name: "Brasil", code: "BR" },
  { name: "Inglaterra", code: "GB" },
  { name: "Espanha", code: "ES" },
  { name: "Itália", code: "IT" },
  { name: "Alemanha", code: "DE" },
  { name: "França", code: "FR" },
  { name: "Argentina", code: "AR" },
  { name: "Portugal", code: "PT" },
];

const LEAGUES = [
  { name: "Brasileirão Série A", countryCode: "BR" },
  { name: "Premier League", countryCode: "GB" },
  { name: "La Liga", countryCode: "ES" },
  { name: "Serie A", countryCode: "IT" },
  { name: "Bundesliga", countryCode: "DE" },
  { name: "Ligue 1", countryCode: "FR" },
  { name: "UEFA Champions League", countryCode: null },
];

const BRANDS = ["Nike", "Adidas", "Puma", "Umbro", "Kappa", "New Balance"];

const SEASONS = [{ label: "2024/2025", startYear: 2024, endYear: 2025 }];

const TEAMS = [
  { name: "Flamengo", countryCode: "BR", leagues: ["Brasileirão Série A"] },
  { name: "Palmeiras", countryCode: "BR", leagues: ["Brasileirão Série A"] },
  {
    name: "Real Madrid",
    countryCode: "ES",
    leagues: ["La Liga", "UEFA Champions League"],
  },
  {
    name: "Barcelona",
    countryCode: "ES",
    leagues: ["La Liga", "UEFA Champions League"],
  },
  {
    name: "Manchester City",
    countryCode: "GB",
    leagues: ["Premier League", "UEFA Champions League"],
  },
  { name: "Liverpool", countryCode: "GB", leagues: ["Premier League"] },
  { name: "Juventus", countryCode: "IT", leagues: ["Serie A"] },
  {
    name: "Bayern de Munique",
    countryCode: "DE",
    leagues: ["Bundesliga", "UEFA Champions League"],
  },
  { name: "Paris Saint-Germain", countryCode: "FR", leagues: ["Ligue 1"] },
  { name: "Boca Juniors", countryCode: "AR", leagues: [] },
];

async function seedCategories() {
  for (const [index, name] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), order: index },
    });
  }
}

async function seedCountries() {
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
}

async function seedLeagues() {
  for (const league of LEAGUES) {
    const country = league.countryCode
      ? await prisma.country.findUnique({ where: { code: league.countryCode } })
      : null;

    await prisma.league.upsert({
      where: { slug: slugify(league.name) },
      update: {},
      create: {
        name: league.name,
        slug: slugify(league.name),
        countryId: country?.id,
      },
    });
  }
}

async function seedBrands() {
  for (const name of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
}

async function seedSeasons() {
  for (const season of SEASONS) {
    await prisma.season.upsert({
      where: { label: season.label },
      update: {},
      create: season,
    });
  }
}

async function seedTeams() {
  for (const team of TEAMS) {
    const country = await prisma.country.findUnique({
      where: { code: team.countryCode },
    });

    const existing = await prisma.team.findUnique({
      where: { slug: slugify(team.name) },
    });
    if (existing) continue;

    const leagues = await prisma.league.findMany({
      where: { name: { in: team.leagues } },
    });

    await prisma.team.create({
      data: {
        name: team.name,
        slug: slugify(team.name),
        countryId: country?.id,
        leagues: {
          create: leagues.map((league) => ({ leagueId: league.id })),
        },
      },
    });
  }
}

async function main() {
  await seedCategories();
  await seedCountries();
  await seedLeagues();
  await seedBrands();
  await seedSeasons();
  await seedTeams();

  console.log(
    `Seed concluído: ${CATEGORIES.length} categorias, ${COUNTRIES.length} países, ${LEAGUES.length} ligas, ${BRANDS.length} marcas, ${SEASONS.length} temporada(s), ${TEAMS.length} times.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
