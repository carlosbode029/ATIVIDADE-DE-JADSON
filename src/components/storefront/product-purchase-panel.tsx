"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";

import { FavoriteButton } from "@/components/storefront/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Variant = { id: string; size: string; stockQuantity: number };
type Patch = { id: string; name: string; price: number };

export function ProductPurchasePanel({
  productId,
  productName,
  productUrl,
  price,
  promoPrice,
  variants,
  patches,
  allowsCustomName,
  allowsCustomNumber,
  allowsPatch,
  isPreOrder,
  leadTimeDays,
  isFavorited,
}: {
  productId: string;
  productName: string;
  productUrl: string;
  price: number;
  promoPrice: number | null;
  variants: Variant[];
  patches: Patch[];
  allowsCustomName: boolean;
  allowsCustomNumber: boolean;
  allowsPatch: boolean;
  isPreOrder: boolean;
  leadTimeDays: number | null;
  isFavorited: boolean;
}) {
  const firstInStock = variants.find((v) => v.stockQuantity > 0);
  const [sizeId, setSizeId] = useState(firstInStock?.id ?? variants[0]?.id ?? "");
  const [patchId, setPatchId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((v) => v.id === sizeId);
  const selectedPatch = patches.find((p) => p.id === patchId);
  const unitPrice = promoPrice ?? price;
  const totalPrice =
    (unitPrice + (selectedPatch?.price ?? 0)) * quantity;
  const outOfStock = !selectedVariant || selectedVariant.stockQuantity === 0;

  const whatsappHref = useMemo(() => {
    const lines = [
      `Olá! Tenho interesse na camisa "${productName}".`,
      selectedVariant ? `Tamanho: ${selectedVariant.size}` : null,
      selectedPatch ? `Patch: ${selectedPatch.name}` : null,
      allowsCustomName && customName ? `Nome: ${customName}` : null,
      allowsCustomNumber && customNumber ? `Número: ${customNumber}` : null,
      `Quantidade: ${quantity}`,
      `Total estimado: ${currencyFormatter.format(totalPrice)}`,
      productUrl,
    ].filter(Boolean);

    return buildWhatsAppLink(lines.join("\n"));
  }, [
    productName,
    selectedVariant,
    selectedPatch,
    allowsCustomName,
    customName,
    allowsCustomNumber,
    customNumber,
    quantity,
    totalPrice,
    productUrl,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-gold">
          {currencyFormatter.format(unitPrice)}
        </span>
        {promoPrice !== null && promoPrice < price && (
          <span className="text-muted-foreground line-through">
            {currencyFormatter.format(price)}
          </span>
        )}
      </div>

      {isPreOrder && (
        <Badge variant="outline">
          Sob encomenda{leadTimeDays ? ` — prazo de ${leadTimeDays} dias` : ""}
        </Badge>
      )}

      <div>
        <p className="mb-1 text-sm font-medium">Tamanho</p>
        <Select value={sizeId} onValueChange={setSizeId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tamanho" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant) => (
              <SelectItem
                key={variant.id}
                value={variant.id}
                disabled={variant.stockQuantity === 0}
              >
                {variant.size}
                {variant.stockQuantity === 0 ? " (esgotado)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {allowsPatch && patches.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Patch (opcional)</p>
          <Select value={patchId} onValueChange={setPatchId}>
            <SelectTrigger>
              <SelectValue placeholder="Sem patch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem patch</SelectItem>
              {patches.map((patch) => (
                <SelectItem key={patch.id} value={patch.id}>
                  {patch.name} (+{currencyFormatter.format(patch.price)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(allowsCustomName || allowsCustomNumber) && (
        <div className="grid grid-cols-2 gap-3">
          {allowsCustomName && (
            <div>
              <p className="mb-1 text-sm font-medium">Nome (opcional)</p>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                maxLength={20}
              />
            </div>
          )}
          {allowsCustomNumber && (
            <div>
              <p className="mb-1 text-sm font-medium">Número (opcional)</p>
              <Input
                value={customNumber}
                onChange={(e) =>
                  setCustomNumber(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                inputMode="numeric"
              />
            </div>
          )}
        </div>
      )}

      <div>
        <p className="mb-1 text-sm font-medium">Quantidade</p>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <span className="text-sm text-muted-foreground">Total estimado</span>
        <span className="font-semibold">
          {currencyFormatter.format(totalPrice)}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          asChild
          variant="gold"
          size="lg"
          className="flex-1"
          disabled={outOfStock}
        >
          <a href={whatsappHref} target="_blank" rel="noreferrer noopener">
            <MessageCircle className="size-4" />
            {outOfStock ? "Tamanho esgotado" : "Comprar pelo WhatsApp"}
          </a>
        </Button>
        <FavoriteButton
          productId={productId}
          initialFavorited={isFavorited}
          className="size-11 border border-border"
        />
      </div>
    </div>
  );
}
