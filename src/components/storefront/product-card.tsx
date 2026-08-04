import Image from "next/image";
import Link from "next/link";

import { FavoriteButton } from "@/components/storefront/favorite-button";
import { Badge } from "@/components/ui/badge";
import type { listProductsStorefront } from "@/modules/catalog/queries/storefront-product.queries";

type Product = Awaited<
  ReturnType<typeof listProductsStorefront>
>["items"][number];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProductCard({
  product,
  isFavorited,
}: {
  product: Product;
  isFavorited: boolean;
}) {
  const image = product.images[0];
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0,
  );
  const hasPromo =
    product.promoPrice !== null &&
    Number(product.promoPrice) < Number(product.price);

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-gold/50"
    >
      <div className="relative aspect-square bg-secondary">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Sem foto
          </div>
        )}

        <FavoriteButton
          productId={product.id}
          initialFavorited={isFavorited}
          className="absolute right-2 top-2"
        />

        {totalStock === 0 && (
          <Badge variant="secondary" className="absolute left-2 top-2">
            Esgotado
          </Badge>
        )}
      </div>

      <div className="p-4">
        {product.team && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.team.name}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-gold">
            {currencyFormatter.format(
              Number(product.promoPrice ?? product.price),
            )}
          </span>
          {hasPromo && (
            <span className="text-xs text-muted-foreground line-through">
              {currencyFormatter.format(Number(product.price))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
