import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { CART_COOKIE_NAME } from "@/modules/cart/services/cart-cookie";

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { order: "asc" as const }, take: 1 } },
      },
      productVariant: true,
      patch: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
};

/**
 * Somente leitura — segura em Server Components. Não cria carrinho nem
 * cookie; isso só acontece nas Server Actions de mutação (`cart.actions.ts`).
 */
export async function getCart() {
  const user = await getCurrentUser();

  if (user) {
    return prisma.cart.findUnique({
      where: { userId: user.id },
      include: CART_INCLUDE,
    });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!sessionId) {
    return null;
  }

  return prisma.cart.findUnique({
    where: { sessionId },
    include: CART_INCLUDE,
  });
}

export async function getCartItemCount() {
  const cart = await getCart();
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
