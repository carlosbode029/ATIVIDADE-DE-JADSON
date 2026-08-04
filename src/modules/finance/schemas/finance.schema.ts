import { z } from "zod";

export const financeTypeValues = ["INCOME", "EXPENSE"] as const;

export const financeEntrySchema = z.object({
  type: z.enum(financeTypeValues),
  category: z.string().trim().min(1, "Informe a categoria"),
  description: z.string().trim().min(1, "Informe a descrição"),
  amount: z.number().min(0.01, "Informe um valor válido"),
  date: z.string().min(1, "Informe a data"),
});

export type FinanceEntryInput = z.infer<typeof financeEntrySchema>;
