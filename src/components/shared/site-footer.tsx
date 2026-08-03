import Link from "next/link";

import { mainCategories, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <span className="font-display text-xl font-bold tracking-wide">
            BK <span className="text-gold">IMPORTS</span>
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">Categorias</h3>
          <ul className="mt-4 space-y-2">
            {mainCategories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categorias/${category.slug}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">Minha conta</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/conta/pedidos"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Meus pedidos
              </Link>
            </li>
            <li>
              <Link
                href="/conta/favoritos"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Favoritos
              </Link>
            </li>
            <li>
              <Link
                href="/conta/enderecos"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Endereços
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">Atendimento</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
