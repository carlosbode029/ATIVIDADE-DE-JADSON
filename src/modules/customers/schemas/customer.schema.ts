import { z } from "zod";

const phoneField = z
  .string()
  .trim()
  .regex(/^\d{10,11}$/, "Informe um telefone válido (DDD + número)")
  .optional()
  .or(z.literal(""));

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo"),
  phone: phoneField,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Dê um nome para este endereço"),
  recipient: z.string().trim().min(2, "Informe o nome do destinatário"),
  phone: phoneField,
  zipCode: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "CEP inválido (somente números, 8 dígitos)"),
  street: z.string().trim().min(1, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim().optional().or(z.literal("")),
  neighborhood: z.string().trim().min(1, "Informe o bairro"),
  city: z.string().trim().min(1, "Informe a cidade"),
  state: z
    .string()
    .trim()
    .length(2, "Use a sigla do estado (ex.: SP)")
    .toUpperCase(),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;
