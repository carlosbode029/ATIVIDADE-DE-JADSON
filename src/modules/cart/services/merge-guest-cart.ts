import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { CART_COOKIE_NAME } from "@/modules/cart/services/cart-cookie";

/**
 * Chamado logo após autenticar (login por senha, cadastro, OAuth, confirmação
 * de e-mail) para que o carrinho montado como visitante não se perca.
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!guestSessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  if (!guestCart) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }

  const userCart = await prisma.cart.findUnique({ where: { userId } });

  if (!userCart) {
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId, sessionId: null },
    });
  } else if (userCart.id !== guestCart.id) {
    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productVariantId: item.productVariantId,
          patchId: item.patchId,
          customName: item.customName,
          customNumber: item.customNumber,
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            patchId: item.patchId,
            customName: item.customName,
            customNumber: item.customNumber,
          },
        });
      }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  cookieStore.delete(CART_COOKIE_NAME);
}
