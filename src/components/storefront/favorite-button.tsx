"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/modules/catalog/actions/favorite.actions";

export function FavoriteButton({
  productId,
  initialFavorited,
  className,
}: {
  productId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavorite(productId);

      if (result.error) {
        toast.error(result.error);
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      setFavorited(Boolean(result.favorited));
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
      aria-pressed={favorited}
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        "bg-background/70 backdrop-blur-sm hover:bg-background",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4",
          favorited && "fill-gold text-gold",
        )}
      />
    </Button>
  );
}
