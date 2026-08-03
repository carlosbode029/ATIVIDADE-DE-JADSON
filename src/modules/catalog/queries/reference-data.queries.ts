import { prisma } from "@/lib/prisma";

export function listCountries() {
  return prisma.country.findMany({ orderBy: { name: "asc" } });
}

export function listBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export function listSeasons() {
  return prisma.season.findMany({ orderBy: { startYear: "desc" } });
}

export function listLeagues() {
  return prisma.league.findMany({
    orderBy: { name: "asc" },
    include: { country: true },
  });
}

export function listTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { country: true, leagues: { include: { league: true } } },
  });
}

export function getTeamBySlug(slug: string) {
  return prisma.team.findUnique({ where: { slug } });
}
