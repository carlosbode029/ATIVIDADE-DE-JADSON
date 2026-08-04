"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "@/modules/cart/actions/cart.actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export type CartItemRowData = {
  id: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  size: string;
  patchName: string | null;
  customName: string | null;
  customNumber: string | null;
  unitPrice: number;
  quantity: number;
};

export function CartItemRow({ item }: { item: CartItemRowData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const lineTotal = item.unitPrice * item.quantity;

  function handleQuantityChange(nextQuantity: number) {
    if (nextQuantity < 1) return;

    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, nextQuantity);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCartItem(item.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      <Link
        href={`/produtos/${item.productSlug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-secondary"
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/produtos/${item.productSlug}`}
            className="text-sm font-medium hover:text-gold"
          >
            {item.productName}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Tamanho: {item.size}
            {item.patchName && ` · Patch: ${item.patchName}`}
            {item.customName && ` · Nome: ${item.customName}`}
            {item.customNumber && ` · Número: ${item.customNumber}`}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7"
              disabled={isPending}
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              −
            </Button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7"
              disabled={isPending}
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              +
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {currencyFormatter.format(lineTotal)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={handleRemove}
              aria-label="Remover item"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
