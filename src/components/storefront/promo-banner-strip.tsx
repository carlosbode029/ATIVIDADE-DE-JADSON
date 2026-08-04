import Image from "next/image";
import Link from "next/link";

import type { Banner } from "@/generated/prisma/client";

export function PromoBannerStrip({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex gap-4 overflow-x-auto">
        {banners.map((banner) => {
          const content = (
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              width={640}
              height={220}
              sizes="(min-width: 640px) 320px, 280px"
              className="h-40 w-full min-w-[280px] rounded-xl object-cover sm:w-80"
            />
          );

          return (
            <div key={banner.id} className="shrink-0">
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} aria-label={banner.title}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
