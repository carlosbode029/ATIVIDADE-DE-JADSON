"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminOnly } from "@/modules/auth/services/require-admin";
import {
  findUserByEmailSchema,
  updateUserRoleSchema,
  type FindUserByEmailInput,
  type UpdateUserRoleInput,
} from "@/modules/team/schemas/team.schema";
import type { Role } from "@/generated/prisma/client";

type FoundUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type FindUserResult = { error?: string; user?: FoundUser };

export async function findUserByEmail(
  input: FindUserByEmailInput,
): Promise<FindUserResult> {
  const parsed = findUserByEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await requireAdminOnly();

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return {
      error:
        "Nenhum usuário com esse e-mail. A pessoa precisa criar a conta na loja antes de receber acesso.",
    };
  }

  return { user };
}

type ActionResult = { error?: string };

export async function updateUserRole(
  input: UpdateUserRoleInput,
): Promise<ActionResult> {
  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminOnly();

  if (parsed.data.userId === admin.id) {
    return { error: "Você não pode alterar sua própria permissão." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });
  if (!targetUser) return { error: "Usuário não encontrado." };

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { role: parsed.data.role },
  });

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    targetUser.supabaseUserId,
    { app_metadata: { role: parsed.data.role } },
  );
  if (error) {
    // Reverte a mudança local para não deixar Prisma e Supabase divergentes.
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { role: targetUser.role },
    });
    return { error: "Não foi possível sincronizar a permissão com o Supabase." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "User",
    entityId: targetUser.id,
    metadata: { from: targetUser.role, to: parsed.data.role },
  });

  revalidatePath("/admin/equipe");
  return {};
}
