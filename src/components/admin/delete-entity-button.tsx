"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteEntityButton({
  name,
  onDelete,
}: {
  name: string;
  onDelete: () => Promise<{ error?: string }>;
}) {
  const [isDeleting, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    startTransition(async () => {
      const result = await onDelete();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Excluído com sucesso.");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Excluir ${name}`}
      disabled={isDeleting}
      onClick={handleClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
