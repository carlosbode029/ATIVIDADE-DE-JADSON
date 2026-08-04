"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  refundOrder,
  updateOrderStatus,
  updateOrderTracking,
} from "@/modules/orders/actions/order-management.actions";
import type { OrderStatus } from "@/generated/prisma/client";

type Carrier = { id: string; name: string };

const REFUNDABLE_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export function OrderManagementPanel({
  orderId,
  status,
  carrierId,
  trackingCode,
  carriers,
}: {
  orderId: string;
  status: OrderStatus;
  carrierId: string | null;
  trackingCode: string | null;
  carriers: Carrier[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedCarrierId, setSelectedCarrierId] = useState(carrierId ?? "");
  const [code, setCode] = useState(trackingCode ?? "");

  function handleStatus(next: "PROCESSING" | "DELIVERED") {
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, status: next });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Status atualizado.");
      }
    });
  }

  function handleShip() {
    if (!selectedCarrierId) {
      toast.error("Selecione a transportadora.");
      return;
    }
    if (!code.trim()) {
      toast.error("Informe o código de rastreio.");
      return;
    }
    startTransition(async () => {
      const result = await updateOrderTracking({
        orderId,
        carrierId: selectedCarrierId,
        trackingCode: code.trim(),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Pedido despachado.");
      }
    });
  }

  function handleRefund() {
    if (
      !window.confirm(
        "Reembolsar este pedido no Mercado Pago e devolver os itens ao estoque? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await refundOrder(orderId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Pedido reembolsado.");
      }
    });
  }

  const canProcess = status === "PAID";
  const canShip = status === "PAID" || status === "PROCESSING";
  const canDeliver = status === "PROCESSING" || status === "SHIPPED";
  const canRefund = REFUNDABLE_STATUSES.includes(status);

  if (!canProcess && !canShip && !canDeliver && !canRefund) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão do pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {(canProcess || canDeliver) && (
          <div className="flex flex-wrap gap-2">
            {canProcess && (
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => handleStatus("PROCESSING")}
              >
                Marcar como em preparação
              </Button>
            )}
            {canDeliver && (
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => handleStatus("DELIVERED")}
              >
                Marcar como entregue
              </Button>
            )}
          </div>
        )}

        {canShip && (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Despachar pedido</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Transportadora</Label>
                <Select value={selectedCarrierId} onValueChange={setSelectedCarrierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Código de rastreio</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
            </div>
            <Button disabled={isPending} onClick={handleShip}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Confirmar despacho
            </Button>
          </div>
        )}

        {canRefund && (
          <div className="border-t border-border pt-4">
            <Button variant="destructive" disabled={isPending} onClick={handleRefund}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Reembolsar pedido
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
