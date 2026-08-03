"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  categorySchema,
  type CategoryInput,
} from "@/modules/catalog/schemas/category.schema";

type ActionResult = { error?: string };

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function createCategory(
  input: CategoryInput,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        parentId: parsed.data.parentId || null,
        imageUrl: parsed.data.imageUrl || null,
        order: parsed.data.order,
        isActive: parsed.data.isActive,
      },
    });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma categoria com esse nome." };
    }
    throw error;
  }

  revalidatePath("/admin/categorias");
  return {};
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (parsed.data.parentId === id) {
    return { error: "Uma categoria não pode ser subcategoria dela mesma." };
  }

  const admin = await requireAdminUser();

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      parentId: parsed.data.parentId || null,
      imageUrl: parsed.data.imageUrl || null,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
    },
  });

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Category",
    entityId: id,
  });

  revalidatePath("/admin/categorias");
  return {};
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não é possível excluir: existem subcategorias ou produtos vinculados.",
    };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Category",
    entityId: id,
  });

  revalidatePath("/admin/categorias");
  return {};
}
