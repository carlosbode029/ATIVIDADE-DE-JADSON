"use client";

import { useState, useTransition } from "react";
import { History, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStockMovements } from "@/modules/inventory/actions/inventory.actions";

type Movement = Awaited<ReturnType<typeof getStockMovements>>[number];

const TYPE_LABELS: Record<Movement["type"], string> = {
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function StockMovementHistoryDialog({
  variantId,
  label,
}: {
  variantId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && movements === null) {
      startTransition(async () => {
        const result = await getStockMovements(variantId);
        setMovements(result);
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="ghost" size="sm" onClick={() => handleOpenChange(true)}>
        <History className="size-4" />
        Histórico
      </Button>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico — {label}</DialogTitle>
        </DialogHeader>

        {isPending && (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isPending && movements?.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma movimentação registrada.
          </p>
        )}

        {!isPending && movements && movements.length > 0 && (
          <div className="space-y-2">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={movement.type === "OUT" ? "secondary" : "gold"}>
                      {TYPE_LABELS[movement.type]}
                    </Badge>
                    <span className="font-medium">{movement.quantity} un.</span>
                  </div>
                  {movement.reason && (
                    <p className="mt-1 text-muted-foreground">{movement.reason}</p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{dateFormatter.format(movement.createdAt)}</p>
                  {movement.createdBy && <p>{movement.createdBy.name}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
