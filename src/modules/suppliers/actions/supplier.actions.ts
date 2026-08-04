"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  supplierSchema,
  type SupplierInput,
} from "@/modules/suppliers/schemas/supplier.schema";

type ActionResult = { error?: string };

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function buildSupplierData(data: SupplierInput) {
  return {
    name: data.name,
    cnpj: data.cnpj || null,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    notes: data.notes || null,
  };
}

export async function createSupplier(input: SupplierInput): Promise<ActionResult> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const supplier = await prisma.supplier.create({ data: buildSupplierData(parsed.data) });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Supplier",
      entityId: supplier.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um fornecedor com esse CNPJ." };
    }
    throw error;
  }

  revalidatePath("/admin/fornecedores");
  return {};
}

export async function updateSupplier(
  id: string,
  input: SupplierInput,
): Promise<ActionResult> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    await prisma.supplier.update({ where: { id }, data: buildSupplierData(parsed.data) });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um fornecedor com esse CNPJ." };
    }
    throw error;
  }

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Supplier",
    entityId: id,
  });

  revalidatePath("/admin/fornecedores");
  return {};
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  await prisma.supplier.delete({ where: { id } });
  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Supplier",
    entityId: id,
  });

  revalidatePath("/admin/fornecedores");
  return {};
}
