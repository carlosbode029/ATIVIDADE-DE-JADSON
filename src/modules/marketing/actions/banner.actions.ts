"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import { bannerSchema, type BannerInput } from "@/modules/marketing/schemas/banner.schema";

type ActionResult = { error?: string };

function buildBannerData(data: BannerInput) {
  return {
    title: data.title,
    imageUrl: data.imageUrl,
    linkUrl: data.linkUrl || null,
    position: data.position,
    order: data.order,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: data.isActive,
  };
}

function revalidateBanners() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createBanner(input: BannerInput): Promise<ActionResult> {
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const banner = await prisma.banner.create({ data: buildBannerData(parsed.data) });
  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "Banner",
    entityId: banner.id,
  });

  revalidateBanners();
  return {};
}

export async function updateBanner(
  id: string,
  input: BannerInput,
): Promise<ActionResult> {
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.banner.update({ where: { id }, data: buildBannerData(parsed.data) });
  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Banner",
    entityId: id,
  });

  revalidateBanners();
  return {};
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  await prisma.banner.delete({ where: { id } });
  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Banner",
    entityId: id,
  });

  revalidateBanners();
  return {};
}
