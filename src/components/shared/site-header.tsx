import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mainCategories, siteConfig } from "@/config/site";
import { getCartItemCount } from "@/modules/cart/queries/get-cart";

const HEADER_CATEGORIES = mainCategories.slice(0, 6);

export async function SiteHeader() {
  const cartItemCount = await getCartItemCount();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-wide text-foreground"
        >
          BK <span className="text-gold">IMPORTS</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {HEADER_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/categorias/${category.slug}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-gold"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Buscar" asChild>
            <Link href="/busca">
              <Search />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Favoritos" asChild>
            <Link href="/conta/favoritos">
              <Heart />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Minha conta" asChild>
            <Link href="/conta/perfil">
              <User />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Carrinho"
            asChild
            className="relative"
          >
            <Link href="/carrinho">
              <ShoppingBag />
              {cartItemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <span className="sr-only">{siteConfig.name}</span>
    </header>
  );
}
