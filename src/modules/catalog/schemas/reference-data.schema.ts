import { z } from "zod";

export const countrySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do país"),
  code: z
    .string()
    .trim()
    .length(2, "Use o código ISO de 2 letras (ex.: BR)")
    .toUpperCase(),
  flagUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
});

export type CountryInput = z.infer<typeof countrySchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca"),
  logoUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const seasonSchema = z
  .object({
    label: z.string().trim().min(1, "Informe o rótulo (ex.: 2024/2025)"),
    startYear: z.number().int().min(1900).max(2100),
    endYear: z.number().int().min(1900).max(2100),
  })
  .refine((data) => data.endYear >= data.startYear, {
    message: "O ano final deve ser maior ou igual ao inicial",
    path: ["endYear"],
  });

export type SeasonInput = z.infer<typeof seasonSchema>;

export const leagueSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da liga/competição"),
  countryId: z.string().trim().optional().or(z.literal("")),
  logoUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
});

export type LeagueInput = z.infer<typeof leagueSchema>;

export const teamSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do time"),
  countryId: z.string().trim().optional().or(z.literal("")),
  logoUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  leagueIds: z.array(z.string()),
});

export type TeamInput = z.infer<typeof teamSchema>;
