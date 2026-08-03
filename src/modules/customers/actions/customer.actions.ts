"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import {
  addressSchema,
  updateProfileSchema,
  type AddressInput,
  type UpdateProfileInput,
} from "@/modules/customers/schemas/customer.schema";

type ActionResult = { error?: string };

async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Você precisa estar autenticado.");
  }
  return user;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await requireCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/conta/perfil");
  return {};
}

export async function createAddress(
  input: AddressInput,
): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await requireCurrentUser();

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    await tx.address.create({
      data: {
        ...parsed.data,
        phone: parsed.data.phone || null,
        complement: parsed.data.complement || null,
        userId: user.id,
      },
    });
  });

  revalidatePath("/conta/enderecos");
  return {};
}

export async function updateAddress(
  addressId: string,
  input: AddressInput,
): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await requireCurrentUser();

  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });
  if (!address || address.userId !== user.id) {
    return { error: "Endereço não encontrado." };
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    await tx.address.update({
      where: { id: addressId },
      data: {
        ...parsed.data,
        phone: parsed.data.phone || null,
        complement: parsed.data.complement || null,
      },
    });
  });

  revalidatePath("/conta/enderecos");
  return {};
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const user = await requireCurrentUser();

  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });
  if (!address || address.userId !== user.id) {
    return { error: "Endereço não encontrado." };
  }

  await prisma.address.delete({ where: { id: addressId } });

  revalidatePath("/conta/enderecos");
  return {};
}
