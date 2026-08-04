import { prisma } from "@/lib/prisma";

export function listCampaigns() {
  return prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
}
