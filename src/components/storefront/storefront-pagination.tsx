import Link from "next/link";

import { Button } from "@/components/ui/button";

export function StorefrontPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Button
          key={p}
          variant={p === page ? "gold" : "outline"}
          size="sm"
          asChild
        >
          <Link href={hrefForPage(p)}>{p}</Link>
        </Button>
      ))}
    </div>
  );
}
