"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYMENT_STATUS_LABELS } from "@/modules/orders/constants";
import {
  createBoletoCharge,
  createCardCharge,
  createPixCharge,
  checkPaymentStatus,
} from "@/modules/payments/actions/payment.actions";
import { cpfSchema } from "@/modules/payments/schemas/payment.schema";

type PixDisplay = {
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
};

type BoletoDisplay = {
  barcodeContent: string | null;
  digitableLine: string | null;
  externalResourceUrl: string | null;
};

type PaymentPanelProps = {
  orderId: string;
  orderTotal: number;
  paymentMethod: "PIX" | "CREDIT_CARD" | "BOLETO";
  paymentStatus: string;
  userEmail: string;
  userDocument: string | null;
  publicKey: string | null;
  initialPixDisplay: PixDisplay;
  initialBoletoDisplay: BoletoDisplay;
};

let mercadoPagoInitialized = false;

function initMercadoPagoOnce(publicKey: string) {
  if (mercadoPagoInitialized) return;
  initMercadoPago(publicKey, { locale: "pt-BR" });
  mercadoPagoInitialized = true;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function CpfField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="cpf">CPF do titular</Label>
      <Input
        id="cpf"
        inputMode="numeric"
        maxLength={11}
        placeholder="Somente números"
        value={value}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
      />
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        toast.success(`${label} copiado.`);
      }}
    >
      <Copy className="size-3.5" />
      Copiar {label.toLowerCase()}
    </Button>
  );
}

export function PaymentPanel({
  orderId,
  orderTotal,
  paymentMethod,
  paymentStatus,
  userEmail,
  userDocument,
  publicKey,
  initialPixDisplay,
  initialBoletoDisplay,
}: PaymentPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cpf, setCpf] = useState(userDocument ?? "");
  const [pixDisplay, setPixDisplay] = useState(initialPixDisplay);
  const [boletoDisplay, setBoletoDisplay] = useState(initialBoletoDisplay);
  const [cardBrickKey, setCardBrickKey] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chargeGenerated = paymentMethod === "PIX" ? Boolean(pixDisplay.qrCode) : Boolean(boletoDisplay.digitableLine);

  useEffect(() => {
    if (paymentMethod === "CREDIT_CARD" || !chargeGenerated) return;

    pollingRef.current = setInterval(() => {
      startTransition(async () => {
        const result = await checkPaymentStatus(orderId);
        if (result.status && result.status !== "pending") {
          router.refresh();
        }
      });
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeGenerated, paymentMethod, orderId]);

  function handleGeneratePix() {
    const parsedCpf = cpfSchema.safeParse(cpf);
    if (!parsedCpf.success) {
      toast.error(parsedCpf.error.issues[0]?.message ?? "CPF inválido.");
      return;
    }
    startTransition(async () => {
      const result = await createPixCharge({ orderId, cpf: parsedCpf.data });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPixDisplay({
        qrCode: result.qrCode ?? null,
        qrCodeBase64: result.qrCodeBase64 ?? null,
        ticketUrl: result.ticketUrl ?? null,
      });
    });
  }

  function handleGenerateBoleto() {
    const parsedCpf = cpfSchema.safeParse(cpf);
    if (!parsedCpf.success) {
      toast.error(parsedCpf.error.issues[0]?.message ?? "CPF inválido.");
      return;
    }
    startTransition(async () => {
      const result = await createBoletoCharge({ orderId, cpf: parsedCpf.data });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setBoletoDisplay({
        barcodeContent: result.barcodeContent ?? null,
        digitableLine: result.digitableLine ?? null,
        externalResourceUrl: result.externalResourceUrl ?? null,
      });
    });
  }

  function handleVerifyNow() {
    startTransition(async () => {
      const result = await checkPaymentStatus(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.status && result.status !== "pending") {
        router.refresh();
      } else {
        toast.info("Ainda aguardando confirmação do pagamento.");
      }
    });
  }

  if (paymentMethod === "PIX") {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pagamento via Pix</CardTitle>
          {chargeGenerated && (
            <Badge variant="outline">{PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!chargeGenerated ? (
            <>
              <CpfField value={cpf} onChange={setCpf} />
              <Button onClick={handleGeneratePix} disabled={isPending} className="w-full">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Gerar QR Code Pix
              </Button>
            </>
          ) : (
            <>
              {pixDisplay.qrCodeBase64 && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${pixDisplay.qrCodeBase64}`}
                    alt="QR Code Pix"
                    width={220}
                    height={220}
                    className="rounded-lg border border-border bg-white p-2"
                  />
                </div>
              )}
              {pixDisplay.qrCode && (
                <div className="space-y-1.5">
                  <Label>Código copia e cola</Label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={pixDisplay.qrCode} className="text-xs" />
                    <CopyButton value={pixDisplay.qrCode} label="Código" />
                  </div>
                </div>
              )}
              <Button
                onClick={handleVerifyNow}
                disabled={isPending}
                variant="outline"
                className="w-full"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Já paguei, verificar agora
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Verificamos automaticamente a cada poucos segundos.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (paymentMethod === "BOLETO") {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pagamento via boleto</CardTitle>
          {chargeGenerated && (
            <Badge variant="outline">{PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!chargeGenerated ? (
            <>
              <CpfField value={cpf} onChange={setCpf} />
              <Button onClick={handleGenerateBoleto} disabled={isPending} className="w-full">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Gerar boleto
              </Button>
            </>
          ) : (
            <>
              {boletoDisplay.digitableLine && (
                <div className="space-y-1.5">
                  <Label>Linha digitável</Label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={boletoDisplay.digitableLine} className="text-xs" />
                    <CopyButton value={boletoDisplay.digitableLine} label="Linha" />
                  </div>
                </div>
              )}
              {boletoDisplay.externalResourceUrl && (
                <Button asChild className="w-full">
                  <a
                    href={boletoDisplay.externalResourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Visualizar / imprimir boleto
                  </a>
                </Button>
              )}
              <Button
                onClick={handleVerifyNow}
                disabled={isPending}
                variant="outline"
                className="w-full"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Verificar pagamento
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                A compensação do boleto pode levar até 3 dias úteis.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagamento via cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pagamento por cartão indisponível no momento. Fale conosco pelo
            WhatsApp para concluir o pedido.
          </p>
        </CardContent>
      </Card>
    );
  }

  initMercadoPagoOnce(publicKey);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via cartão</CardTitle>
      </CardHeader>
      <CardContent>
        <CardPayment
          key={cardBrickKey}
          initialization={{ amount: orderTotal, payer: { email: userEmail } }}
          onSubmit={async (formData) => {
            const result = await createCardCharge({
              orderId,
              cpf: onlyDigits(formData.payer.identification?.number ?? ""),
              token: formData.token,
              installments: formData.installments,
              paymentMethodId: formData.payment_method_id,
              issuerId: formData.issuer_id,
            });

            if (result.error) {
              toast.error(result.error);
              setCardBrickKey((k) => k + 1);
              return;
            }

            toast.success("Pagamento aprovado!");
            router.refresh();
          }}
          onError={(error) => {
            console.error("Card Payment Brick error:", error);
            toast.error("Não foi possível processar o cartão. Tente novamente.");
          }}
        />
      </CardContent>
    </Card>
  );
}
