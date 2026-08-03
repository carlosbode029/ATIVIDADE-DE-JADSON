"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { addToCartSchema, type AddToCartInput } from "@/modules/cart/schemas/cart.schema";
import {
  CART_COOKIE_MAX_AGE,
  CART_COOKIE_NAME,
} from "@/modules/cart/services/cart-cookie";

type ActionResult = { error?: string };

async function resolveCartForWrite() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();

  if (user) {
    const existing = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (existing) return existing;

    const guestSessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
    const guestCart = guestSessionId
      ? await prisma.cart.findUnique({ where: { sessionId: guestSessionId } })
      : null;

    if (guestCart) {
      const merged = await prisma.cart.update({
        where: { id: guestCart.id },
        data: { userId: user.id, sessionId: null },
      });
      cookieStore.delete(CART_COOKIE_NAME);
      return merged;
    }

    return prisma.cart.create({ data: { userId: user.id } });
  }

  const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (sessionId) {
    const existing = await prisma.cart.findUnique({ where: { sessionId } });
    if (existing) return existing;
  }

  const newSessionId = randomUUID();
  const cart = await prisma.cart.create({ data: { sessionId: newSessionId } });
  cookieStore.set(CART_COOKIE_NAME, newSessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return cart;
}

async function assertCartItemOwnership(cartItemId: string) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem) return null;

  const owned = user
    ? cartItem.cart.userId === user.id
    : Boolean(sessionId) && cartItem.cart.sessionId === sessionId;

  return owned ? cartItem : null;
}

export async function addToCart(input: AddToCartInput): Promise<ActionResult> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.productVariantId },
    include: { product: true },
  });

  if (!variant || !variant.product.isActive) {
    return { error: "Produto indisponível." };
  }

  if (variant.stockQuantity < parsed.data.quantity) {
    return { error: "Estoque insuficiente para este tamanho." };
  }

  const patchId = parsed.data.patchId || null;
  const customName = parsed.data.customName || null;
  const customNumber = parsed.data.customNumber || null;

  const cart = await resolveCartForWrite();

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productVariantId: parsed.data.productVariantId,
      patchId,
      customName,
      customNumber,
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parsed.data.quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.data.productId,
        productVariantId: parsed.data.productVariantId,
        quantity: parsed.data.quantity,
        patchId,
        customName,
        customNumber,
      },
    });
  }

  revalidatePath("/carrinho");
  return {};
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<ActionResult> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return { error: "Quantidade inválida." };
  }

  const cartItem = await assertCartItemOwnership(cartItemId);
  if (!cartItem) {
    return { error: "Item não encontrado." };
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: cartItem.productVariantId },
  });
  if (!variant || variant.stockQuantity < quantity) {
    return { error: "Estoque insuficiente para essa quantidade." };
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  revalidatePath("/carrinho");
  return {};
}

export async function removeCartItem(cartItemId: string): Promise<ActionResult> {
  const cartItem = await assertCartItemOwnership(cartItemId);
  if (!cartItem) {
    return { error: "Item não encontrado." };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  revalidatePath("/carrinho");
  return {};
}
