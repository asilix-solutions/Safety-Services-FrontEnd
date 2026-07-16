"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { getStripe } from "@/lib/stripe";

const LIGHT_APPEARANCE: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#4f46e5",
    colorBackground: "#ffffff",
    colorText: "#0f172a",
    colorDanger: "#ef4444",
    borderRadius: "12px",
  },
};

const DARK_APPEARANCE: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#6366f1",
    colorBackground: "#0f172a",
    colorText: "#f8fafc",
    colorDanger: "#f87171",
    borderRadius: "12px",
  },
};

interface StripePaymentElementProps {
  amount: number;
  currency: string;
  isPaying: boolean;
  onPaySuccess: () => void;
  onCancel: () => void;
}

function PayForm({ isPaying, onPaySuccess, onCancel }: Omit<StripePaymentElementProps, "amount" | "currency">) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [isValidating, setIsValidating] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsValidating(true);
    const { error } = await elements.submit();
    setIsValidating(false);
    if (error) return;
    // Test-mode only: no backend PaymentIntent exists, so we intentionally
    // skip stripe.confirmPayment() and simulate success client-side.
    onPaySuccess();
  };

  const busy = isPaying || isValidating;

  return (
    <>
      <PaymentElement />
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs"
          onClick={onCancel}
          disabled={busy}
        >
          {t("common:invoices_pay_cancel_btn")}
        </Button>
        <Button
          size="sm"
          className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90"
          onClick={handlePay}
          disabled={busy || !stripe || !elements}
        >
          {busy ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              {t("common:loading")}
            </span>
          ) : (
            t("common:invoices_pay_confirm_btn")
          )}
        </Button>
      </div>
    </>
  );
}

export function StripePaymentElement({
  amount,
  currency,
  isPaying,
  onPaySuccess,
  onCancel,
}: StripePaymentElementProps) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stripePromise = useMemo(() => getStripe(), []);

  const appearance = resolvedTheme === "dark" ? DARK_APPEARANCE : LIGHT_APPEARANCE;

  if (!mounted) {
    return <div className="h-40 rounded-lg border border-border bg-muted/40 animate-pulse" />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">{t("common:invoices_pay_card_label")}</p>
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          appearance,
        }}
      >
        <PayForm isPaying={isPaying} onPaySuccess={onPaySuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}

export default StripePaymentElement;
