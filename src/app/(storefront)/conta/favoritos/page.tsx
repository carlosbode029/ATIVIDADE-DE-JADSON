import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getFavoritesByUserId } from "@/modules/catalog/queries/get-favorites";

export const metadata: Metadata = {
  title: "Meus favoritos",
};

export default async function FavoritosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/conta/favoritos");
  }

  const favorites = await getFavoritesByUserId(user.id);

  if (favorites.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-medium">Você ainda não favoritou nenhuma camisa.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Toque no coração de um produto para guardá-lo aqui.
        </p>
        <Button variant="gold" className="mt-6" asChild>
          <Link href="/produtos">Ver camisas</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <Link
          key={favorite.id}
          href={`/produtos/${favorite.product.slug}`}
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/50"
        >
          <p className="font-medium">{favorite.product.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(favorite.product.promoPrice ?? favorite.product.price))}
          </p>
        </Link>
      ))}
    </section>
  );
}
