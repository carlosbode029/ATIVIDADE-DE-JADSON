"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  financeEntrySchema,
  type FinanceEntryInput,
} from "@/modules/finance/schemas/finance.schema";

type ActionResult = { error?: string };

function buildFinanceEntryData(data: FinanceEntryInput) {
  return {
    type: data.type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    date: new Date(data.date),
  };
}

export async function createFinanceEntry(
  input: FinanceEntryInput,
): Promise<ActionResult> {
  const parsed = financeEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const entry = await prisma.financeEntry.create({ data: buildFinanceEntryData(parsed.data) });
  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "FinanceEntry",
    entityId: entry.id,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return {};
}

export async function updateFinanceEntry(
  id: string,
  input: FinanceEntryInput,
): Promise<ActionResult> {
  const parsed = financeEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const entry = await prisma.financeEntry.findUnique({ where: { id } });
  if (!entry) return { error: "Lançamento não encontrado." };
  if (entry.orderId) {
    return {
      error: "Lançamentos gerados automaticamente por pedidos não podem ser editados.",
    };
  }

  await prisma.financeEntry.update({ where: { id }, data: buildFinanceEntryData(parsed.data) });
  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "FinanceEntry",
    entityId: id,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return {};
}

export async function deleteFinanceEntry(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  const entry = await prisma.financeEntry.findUnique({ where: { id } });
  if (!entry) return { error: "Lançamento não encontrado." };
  if (entry.orderId) {
    return {
      error: "Lançamentos gerados automaticamente por pedidos não podem ser excluídos.",
    };
  }

  await prisma.financeEntry.delete({ where: { id } });
  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "FinanceEntry",
    entityId: id,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return {};
}
