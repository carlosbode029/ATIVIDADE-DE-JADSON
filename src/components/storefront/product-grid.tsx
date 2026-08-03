import { ProductCard } from "@/components/storefront/product-card";
import type { listProductsStorefront } from "@/modules/catalog/queries/storefront-product.queries";

type Products = Awaited<ReturnType<typeof listProductsStorefront>>["items"];

export function ProductGrid({
  products,
  favoritedIds,
}: {
  products: Products;
  favoritedIds: Set<string>;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        Nenhum produto encontrado com esses filtros.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorited={favoritedIds.has(product.id)}
        />
      ))}
    </div>
  );
}
