import type { Metadata } from "next";
import Link from "next/link";

import { CartItemRow, type CartItemRowData } from "@/components/storefront/cart-item-row";
import { Button } from "@/components/ui/button";
import { getCart } from "@/modules/cart/queries/get-cart";

export const metadata: Metadata = {
  title: "Carrinho",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function CarrinhoPage() {
  const cart = await getCart();
  const cartItems = cart?.items ?? [];

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore o catálogo e vista a camisa do seu time.
        </p>
        <Button variant="gold" className="mt-6" asChild>
          <Link href="/produtos">Ver camisas</Link>
        </Button>
      </div>
    );
  }

  const items: CartItemRowData[] = cartItems.map((item) => ({
    id: item.id,
    productSlug: item.product.slug,
    productName: item.product.name,
    imageUrl: item.product.images[0]?.url ?? null,
    size: item.productVariant.size,
    patchName: item.patch?.name ?? null,
    customName: item.customName,
    customNumber: item.customNumber,
    unitPrice:
      Number(
        item.productVariant.priceOverride ??
          item.product.promoPrice ??
          item.product.price,
      ) + Number(item.patch?.price ?? 0),
    quantity: item.quantity,
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-bold sm:text-3xl">
        Meu carrinho
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">
              {currencyFormatter.format(subtotal)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Frete calculado no checkout.
          </p>
          <Button variant="gold" className="mt-4 w-full" asChild>
            <Link href="/checkout">Ir para o checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
