"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getCart } from "@/modules/cart/queries/get-cart";
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/modules/checkout/schemas/checkout.schema";
import { calculateShippingCost } from "@/modules/checkout/services/calculate-shipping";
import { computeCartTotals } from "@/modules/checkout/services/compute-cart-totals";
import { validateCoupon } from "@/modules/checkout/services/validate-coupon";

type ActionResult = { error?: string };

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${timestamp}${random}`;
}

export async function previewCoupon(
  code: string,
  subtotal: number,
): Promise<{ error?: string; discount?: number }> {
  if (!code.trim()) {
    return { error: "Informe um código de cupom." };
  }

  const result = await validateCoupon(code, subtotal);
  if (!result.ok) {
    return { error: result.error };
  }

  return { discount: result.discount };
}

export async function createOrder(input: CheckoutInput): Promise<ActionResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Você precisa estar autenticado." };
  }

  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return { error: "Seu carrinho está vazio." };
  }

  const address = await prisma.address.findUnique({
    where: { id: parsed.data.addressId },
  });
  if (!address || address.userId !== user.id) {
    return { error: "Endereço de entrega inválido." };
  }

  const shippingMethod = await prisma.shippingMethod.findUnique({
    where: { id: parsed.data.shippingMethodId },
  });
  if (!shippingMethod || !shippingMethod.isActive) {
    return { error: "Opção de frete inválida." };
  }

  for (const item of cart.items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.productVariantId },
    });
    if (!variant || variant.stockQuantity < item.quantity) {
      return {
        error: `Estoque insuficiente para "${item.product.name}" (tamanho ${item.productVariant.size}).`,
      };
    }
  }

  const { subtotal, totalWeightGrams } = computeCartTotals(cart.items);
  const shippingCost = calculateShippingCost(
    {
      basePrice: Number(shippingMethod.basePrice),
      pricePerKg: Number(shippingMethod.pricePerKg),
    },
    totalWeightGrams,
  );

  let discount = 0;
  let couponId: string | null = null;

  if (parsed.data.couponCode) {
    const result = await validateCoupon(parsed.data.couponCode, subtotal);
    if (!result.ok) {
      return { error: result.error };
    }
    discount = result.discount;
    couponId = result.coupon.id;
  }

  const total = Math.max(0, subtotal + shippingCost - discount);
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        subtotal,
        discount,
        shippingCost,
        total,
        couponId,
        shippingAddressId: address.id,
        shippingMethodId: shippingMethod.id,
        carrierId: shippingMethod.carrierId,
        items: {
          create: cart.items.map((item) => ({
            productVariantId: item.productVariantId,
            nameSnapshot: item.product.name,
            sizeSnapshot: item.productVariant.size,
            unitPrice: Number(
              item.productVariant.priceOverride ??
                item.product.promoPrice ??
                item.product.price,
            ),
            quantity: item.quantity,
            customName: item.customName,
            customNumber: item.customNumber,
            patchId: item.patchId,
            patchPriceSnapshot: item.patch ? Number(item.patch.price) : null,
          })),
        },
        payments: {
          create: {
            provider: "MERCADO_PAGO",
            method: parsed.data.paymentMethod,
            status: "PENDING",
            amount: total,
          },
        },
      },
    });

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  revalidatePath("/carrinho");
  revalidatePath("/conta/pedidos");
  redirect(`/pedido/${order.id}`);
}
