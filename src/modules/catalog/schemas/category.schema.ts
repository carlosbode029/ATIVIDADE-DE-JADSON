import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria"),
  parentId: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
