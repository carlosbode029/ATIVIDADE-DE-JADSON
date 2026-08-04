import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().trim().min(1, "Informe o título"),
  imageUrl: z.string().trim().min(1, "Envie a imagem do banner").url("URL inválida"),
  linkUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  position: z.string().trim().min(1, "Informe a posição"),
  order: z.number().int().min(0),
  startsAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type BannerInput = z.infer<typeof bannerSchema>;
