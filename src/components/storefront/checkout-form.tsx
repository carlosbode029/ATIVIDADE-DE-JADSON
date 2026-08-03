"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AddressFormDialog } from "@/components/storefront/account/address-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrder, previewCoupon } from "@/modules/checkout/actions/checkout.actions";
import { paymentMethodValues } from "@/modules/checkout/schemas/checkout.schema";
import type { Address } from "@/generated/prisma/client";

type ShippingOption = {
  id: string;
  name: string;
  carrierName: string;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const PAYMENT_LABELS: Record<(typeof paymentMethodValues)[number], string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};

export function CheckoutForm({
  addresses,
  shippingOptions,
  subtotal,
}: {
  addresses: Address[];
  shippingOptions: ShippingOption[];
  subtotal: number;
}) {
  const router = useRouter();
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [shippingMethodId, setShippingMethodId] = useState(
    shippingOptions[0]?.id ?? "",
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<
    { code: string; discount: number } | null
  >(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof paymentMethodValues)[number]>("PIX");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedShipping = shippingOptions.find((s) => s.id === shippingMethodId);
  const shippingCost = selectedShipping?.cost ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = useMemo(
    () => Math.max(0, subtotal + shippingCost - discount),
    [subtotal, shippingCost, discount],
  );

  async function handleApplyCoupon() {
    setCouponError(null);
    setIsApplyingCoupon(true);
    const result = await previewCoupon(couponInput, subtotal);
    setIsApplyingCoupon(false);

    if (result.error || result.discount === undefined) {
      setCouponError(result.error ?? "Cupom inválido.");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discount: result.discount });
  }

  async function handleSubmit() {
    setFormError(null);

    if (!addressId) {
      setFormError("Selecione um endereço de entrega.");
      return;
    }
    if (!shippingMethodId) {
      setFormError("Selecione uma opção de frete.");
      return;
    }

    setIsSubmitting(true);
    const result = await createOrder({
      addressId,
      shippingMethodId,
      couponCode: appliedCoupon?.code ?? "",
      paymentMethod,
    });
    setIsSubmitting(false);

    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Endereço de entrega</h2>
            <AddressFormDialog
              trigger={
                <Button type="button" variant="outline" size="sm">
                  <Plus className="size-4" />
                  Novo endereço
                </Button>
              }
              onSuccess={() => router.refresh()}
            />
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cadastre um endereço para continuar.
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                    addressId === address.id
                      ? "border-gold bg-gold/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={addressId === address.id}
                    onChange={() => setAddressId(address.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {address.label}
                      {address.isDefault && <Badge variant="gold">Padrão</Badge>}
                    </div>
                    <p className="text-muted-foreground">
                      {address.street}, {address.number}
                      {address.complement ? ` — ${address.complement}` : ""} —{" "}
                      {address.neighborhood}, {address.city}/{address.state} —
                      CEP {address.zipCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Frete</h2>
          {shippingOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma opção de frete disponível no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${
                    shippingMethodId === option.id
                      ? "border-gold bg-gold/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethodId === option.id}
                      onChange={() => setShippingMethodId(option.id)}
                    />
                    <div>
                      <p className="font-medium">
                        {option.carrierName} — {option.name}
                      </p>
                      <p className="text-muted-foreground">
                        {option.estimatedDaysMin}-{option.estimatedDaysMax} dias
                        úteis
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {currencyFormatter.format(option.cost)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Cupom de desconto</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Código do cupom"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isApplyingCoupon || !couponInput}
              onClick={handleApplyCoupon}
            >
              Aplicar
            </Button>
          </div>
          {couponError && (
            <p className="mt-1 text-sm text-destructive">{couponError}</p>
          )}
          {appliedCoupon && (
            <p className="mt-1 text-sm text-gold">
              Cupom {appliedCoupon.code} aplicado: -
              {currencyFormatter.format(appliedCoupon.discount)}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Forma de pagamento</h2>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethodValues.map((method) => (
              <label
                key={method}
                className={`cursor-pointer rounded-lg border p-3 text-center text-sm ${
                  paymentMethod === method
                    ? "border-gold bg-gold/5"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {PAYMENT_LABELS[method]}
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="h-fit space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Resumo do pedido</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{currencyFormatter.format(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frete</span>
            <span>{currencyFormatter.format(shippingCost)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-gold">
              <span>Desconto</span>
              <span>-{currencyFormatter.format(discount)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <span>{currencyFormatter.format(total)}</span>
        </div>

        {formError && (
          <p className="text-sm font-medium text-destructive">{formError}</p>
        )}

        <Button
          type="button"
          variant="gold"
          className="w-full"
          size="lg"
          disabled={isSubmitting || addresses.length === 0 || shippingOptions.length === 0}
          onClick={() => {
            handleSubmit().catch(() => {
              toast.error("Não foi possível finalizar o pedido.");
            });
          }}
        >
          Finalizar pedido
        </Button>
      </div>
    </div>
  );
}
