import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/storefront/product-card";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getFavoritedProductIds } from "@/modules/catalog/queries/get-favorites";
import { getProductBySlug } from "@/modules/catalog/queries/storefront-product.queries";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado" };
  }

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const user = await getCurrentUser();
  const productUrl = `${siteConfig.url}/produtos/${product.slug}`;

  const favoritedIds = user
    ? await getFavoritedProductIds(user.id, [product.id])
    : new Set<string>();

  const relatedProducts = product.relatedFrom.map((rel) => rel.relatedProduct);
  const relatedFavoritedIds = user
    ? await getFavoritedProductIds(
        user.id,
        relatedProducts.map((p) => p.id),
      )
    : new Set<string>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.url),
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BRL",
      price: Number(product.promoPrice ?? product.price).toFixed(2),
      availability: product.variants.some((v) => v.stockQuantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          videos={product.videos}
          productName={product.name}
        />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.team && <Badge variant="outline">{product.team.name}</Badge>}
            {product.league && <Badge variant="outline">{product.league.name}</Badge>}
            {product.season && <Badge variant="outline">{product.season.label}</Badge>}
            <Badge variant="outline">
              {product.model === "TORCEDOR" ? "Torcedor" : "Jogador"}
            </Badge>
          </div>

          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-6">
            <ProductPurchasePanel
              productId={product.id}
              productName={product.name}
              productUrl={productUrl}
              price={Number(product.price)}
              promoPrice={product.promoPrice ? Number(product.promoPrice) : null}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                stockQuantity: v.stockQuantity,
              }))}
              patches={product.patches.map((p) => ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
              }))}
              allowsCustomName={product.allowsCustomName}
              allowsCustomNumber={product.allowsCustomNumber}
              allowsPatch={product.allowsPatch}
              isPreOrder={product.isPreOrder}
              leadTimeDays={product.leadTimeDays}
              isFavorited={favoritedIds.has(product.id)}
            />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="mb-2 text-sm font-semibold">Descrição</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-xl font-bold">
            Você também pode gostar
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={related}
                isFavorited={relatedFavoritedIds.has(related.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
