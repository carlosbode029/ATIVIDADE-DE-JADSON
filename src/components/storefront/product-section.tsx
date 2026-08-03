import Link from "next/link";

import { ProductGrid } from "@/components/storefront/product-grid";
import type { listLatestProducts } from "@/modules/catalog/queries/storefront-product.queries";

type Products = Awaited<ReturnType<typeof listLatestProducts>>;

export function ProductSection({
  title,
  href,
  products,
  favoritedIds,
}: {
  title: string;
  href: string;
  products: Products;
  favoritedIds: Set<string>;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm font-medium text-gold hover:underline"
        >
          Ver todas
        </Link>
      </div>
      <ProductGrid products={products} favoritedIds={favoritedIds} />
    </section>
  );
}
