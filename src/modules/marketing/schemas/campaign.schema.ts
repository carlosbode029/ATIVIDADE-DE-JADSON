import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da campanha"),
  description: z.string().trim().optional().or(z.literal("")),
  channel: z.string().trim().min(1, "Informe o canal"),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  budget: z.number().min(0).optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
