"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type MediaItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export function ProductGallery({
  images,
  videos,
  productName,
}: {
  images: { url: string }[];
  videos: { url: string }[];
  productName: string;
}) {
  const items: MediaItem[] = [
    ...images.map((image) => ({ type: "image" as const, url: image.url })),
    ...videos.map((video) => ({ type: "video" as const, url: video.url })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex];

  if (items.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary text-sm text-muted-foreground">
        Sem mídia disponível
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
        {active.type === "image" ? (
          <Image
            src={active.url}
            alt={productName}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        ) : (
          <video
            src={active.url}
            controls
            className="size-full object-cover"
          />
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {items.map((item, index) => (
            <button
              key={`${item.type}-${item.url}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 bg-secondary",
                index === activeIndex ? "border-gold" : "border-transparent",
              )}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                  Vídeo
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
