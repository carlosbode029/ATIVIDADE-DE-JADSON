"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  brandSchema,
  countrySchema,
  leagueSchema,
  seasonSchema,
  teamSchema,
  type BrandInput,
  type CountryInput,
  type LeagueInput,
  type SeasonInput,
  type TeamInput,
} from "@/modules/catalog/schemas/reference-data.schema";

type ActionResult = { error?: string };

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

// ---------------------------------------------------------------------------
// País
// ---------------------------------------------------------------------------

export async function createCountry(input: CountryInput): Promise<ActionResult> {
  const parsed = countrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const country = await prisma.country.create({
      data: { ...parsed.data, flagUrl: parsed.data.flagUrl || null },
    });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Country",
      entityId: country.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um país com esse nome ou código." };
    }
    throw error;
  }

  revalidatePath("/admin/paises");
  return {};
}

export async function updateCountry(
  id: string,
  input: CountryInput,
): Promise<ActionResult> {
  const parsed = countrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    await prisma.country.update({
      where: { id },
      data: { ...parsed.data, flagUrl: parsed.data.flagUrl || null },
    });
    await recordAuditLog({
      userId: admin.id,
      action: "UPDATE",
      entity: "Country",
      entityId: id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um país com esse nome ou código." };
    }
    throw error;
  }

  revalidatePath("/admin/paises");
  return {};
}

export async function deleteCountry(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.country.delete({ where: { id } });
  } catch {
    return {
      error: "Não é possível excluir: existem times/ligas/produtos vinculados.",
    };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Country",
    entityId: id,
  });
  revalidatePath("/admin/paises");
  return {};
}

// ---------------------------------------------------------------------------
// Marca
// ---------------------------------------------------------------------------

export async function createBrand(input: BrandInput): Promise<ActionResult> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const brand = await prisma.brand.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        logoUrl: parsed.data.logoUrl || null,
      },
    });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Brand",
      entityId: brand.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma marca com esse nome." };
    }
    throw error;
  }

  revalidatePath("/admin/marcas");
  return {};
}

export async function updateBrand(
  id: string,
  input: BrandInput,
): Promise<ActionResult> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.brand.update({
    where: { id },
    data: { name: parsed.data.name, logoUrl: parsed.data.logoUrl || null },
  });
  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Brand",
    entityId: id,
  });

  revalidatePath("/admin/marcas");
  return {};
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.brand.delete({ where: { id } });
  } catch {
    return { error: "Não é possível excluir: existem produtos vinculados." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Brand",
    entityId: id,
  });
  revalidatePath("/admin/marcas");
  return {};
}

// ---------------------------------------------------------------------------
// Temporada
// ---------------------------------------------------------------------------

export async function createSeason(input: SeasonInput): Promise<ActionResult> {
  const parsed = seasonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const season = await prisma.season.create({ data: parsed.data });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Season",
      entityId: season.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma temporada com esse rótulo." };
    }
    throw error;
  }

  revalidatePath("/admin/temporadas");
  return {};
}

export async function updateSeason(
  id: string,
  input: SeasonInput,
): Promise<ActionResult> {
  const parsed = seasonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.season.update({ where: { id }, data: parsed.data });
  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Season",
    entityId: id,
  });

  revalidatePath("/admin/temporadas");
  return {};
}

export async function deleteSeason(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.season.delete({ where: { id } });
  } catch {
    return { error: "Não é possível excluir: existem produtos vinculados." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Season",
    entityId: id,
  });
  revalidatePath("/admin/temporadas");
  return {};
}

// ---------------------------------------------------------------------------
// Liga / competição
// ---------------------------------------------------------------------------

export async function createLeague(input: LeagueInput): Promise<ActionResult> {
  const parsed = leagueSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const league = await prisma.league.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        countryId: parsed.data.countryId || null,
        logoUrl: parsed.data.logoUrl || null,
      },
    });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "League",
      entityId: league.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma liga com esse nome." };
    }
    throw error;
  }

  revalidatePath("/admin/ligas");
  return {};
}

export async function updateLeague(
  id: string,
  input: LeagueInput,
): Promise<ActionResult> {
  const parsed = leagueSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.league.update({
    where: { id },
    data: {
      name: parsed.data.name,
      countryId: parsed.data.countryId || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });
  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "League",
    entityId: id,
  });

  revalidatePath("/admin/ligas");
  return {};
}

export async function deleteLeague(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.league.delete({ where: { id } });
  } catch {
    return { error: "Não é possível excluir: existem produtos vinculados." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "League",
    entityId: id,
  });
  revalidatePath("/admin/ligas");
  return {};
}

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

export async function createTeam(input: TeamInput): Promise<ActionResult> {
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const team = await prisma.team.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        countryId: parsed.data.countryId || null,
        logoUrl: parsed.data.logoUrl || null,
        leagues: {
          create: parsed.data.leagueIds.map((leagueId) => ({ leagueId })),
        },
      },
    });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Team",
      entityId: team.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um time com esse nome." };
    }
    throw error;
  }

  revalidatePath("/admin/times");
  return {};
}

export async function updateTeam(
  id: string,
  input: TeamInput,
): Promise<ActionResult> {
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.$transaction([
    prisma.teamLeague.deleteMany({ where: { teamId: id } }),
    prisma.team.update({
      where: { id },
      data: {
        name: parsed.data.name,
        countryId: parsed.data.countryId || null,
        logoUrl: parsed.data.logoUrl || null,
        leagues: {
          create: parsed.data.leagueIds.map((leagueId) => ({ leagueId })),
        },
      },
    }),
  ]);

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Team",
    entityId: id,
  });

  revalidatePath("/admin/times");
  return {};
}

export async function deleteTeam(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.team.delete({ where: { id } });
  } catch {
    return { error: "Não é possível excluir: existem produtos vinculados." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Team",
    entityId: id,
  });
  revalidatePath("/admin/times");
  return {};
}
