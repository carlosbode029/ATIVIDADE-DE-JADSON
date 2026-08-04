"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  campaignSchema,
  type CampaignInput,
} from "@/modules/marketing/schemas/campaign.schema";

type ActionResult = { error?: string };

function buildCampaignData(data: CampaignInput) {
  return {
    name: data.name,
    description: data.description || null,
    channel: data.channel,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    budget: data.budget ?? null,
  };
}

export async function createCampaign(input: CampaignInput): Promise<ActionResult> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const campaign = await prisma.campaign.create({ data: buildCampaignData(parsed.data) });
  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "Campaign",
    entityId: campaign.id,
  });

  revalidatePath("/admin/campanhas");
  return {};
}

export async function updateCampaign(
  id: string,
  input: CampaignInput,
): Promise<ActionResult> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.campaign.update({ where: { id }, data: buildCampaignData(parsed.data) });
  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Campaign",
    entityId: id,
  });

  revalidatePath("/admin/campanhas");
  return {};
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  await prisma.campaign.delete({ where: { id } });
  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Campaign",
    entityId: id,
  });

  revalidatePath("/admin/campanhas");
  return {};
}
