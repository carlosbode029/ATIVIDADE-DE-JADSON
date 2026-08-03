import Link from "next/link";

import { mainCategories } from "@/config/site";

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">
        Compre por categoria
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {mainCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/categorias/${category.slug}`}
            className="group flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-gold/50"
          >
            <span className="text-sm font-medium transition-colors group-hover:text-gold">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
