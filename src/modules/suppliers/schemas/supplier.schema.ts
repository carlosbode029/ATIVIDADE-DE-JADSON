import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do fornecedor"),
  cnpj: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "Informe um CNPJ válido (somente números, 14 dígitos)")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
