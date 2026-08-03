"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";

type ToggleFavoriteResult = { error?: string; favorited?: boolean };

export async function toggleFavorite(
  productId: string,
): Promise<ToggleFavoriteResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Entre na sua conta para favoritar produtos." };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/conta/favoritos");
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId: user.id, productId } });
  revalidatePath("/conta/favoritos");
  return { favorited: true };
}
