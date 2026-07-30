"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { paymentProvider } from "@/domains/payments/provider";

interface SimulatedPaymentFormProps {
  invoiceId: string;
  jobNumber: string;
  amount: number;
  currency: string;
  isPaying: boolean;
  onPaySuccess: (transactionReference: string) => void;
  onCancel: () => void;
}

const TEST_CARD = { number: "4242424242424242", expiry: "1230", cvc: "123", holder: "SSLM DEMO" };

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (digits: string) => digits.replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (digits: string) =>
  digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

export function SimulatedPaymentForm({
  invoiceId,
  jobNumber,
  amount,
  currency,
  isPaying,
  onPaySuccess,
  onCancel,
}: SimulatedPaymentFormProps) {
  const { t } = useTranslation();
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");
  const [isSettling, setIsSettling] = useState(false);

  // Length checks only — the simulation accepts any digits.
  const isComplete =
    number.length === 16 && expiry.length === 4 && cvc.length >= 3 && holder.trim().length > 0;

  const busy = isPaying || isSettling;

  const handleFillTestCard = () => {
    setNumber(TEST_CARD.number);
    setExpiry(TEST_CARD.expiry);
    setCvc(TEST_CARD.cvc);
    setHolder(TEST_CARD.holder);
  };

  const handlePay = async () => {
    if (!isComplete || busy) return;
    setIsSettling(true);
    try {
      const result = await paymentProvider.initiatePayment({
        invoiceId,
        jobNumber,
        amount,
        currency,
      });
      if (result.status === "succeeded") {
        onPaySuccess(result.transactionReference);
      }
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("common:invoices_pay_card_label")}
        </p>
        <Badge variant="warning" className="text-[9px] uppercase">
          {t("common:invoices_pay_simulation_badge")}
        </Badge>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-secondary/10 p-3">
        <div className="space-y-1.5">
          <Label htmlFor="sim-card-number" className="text-[11px] text-muted-foreground">
            {t("common:invoices_pay_card_number")}
          </Label>
          {/* Card numbers read left-to-right in every locale, so the field opts out
              of the document direction while the label follows it. */}
          <Input
            id="sim-card-number"
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            className="h-9 text-sm font-mono tracking-wider text-start"
            value={formatCardNumber(number)}
            onChange={(e) => setNumber(digitsOnly(e.target.value).slice(0, 16))}
            disabled={busy}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sim-card-expiry" className="text-[11px] text-muted-foreground">
              {t("common:invoices_pay_card_expiry")}
            </Label>
            <Input
              id="sim-card-expiry"
              dir="ltr"
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM/YY"
              className="h-9 text-sm font-mono text-start"
              value={formatExpiry(expiry)}
              onChange={(e) => setExpiry(digitsOnly(e.target.value).slice(0, 4))}
              disabled={busy}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sim-card-cvc" className="text-[11px] text-muted-foreground">
              {t("common:invoices_pay_card_cvc")}
            </Label>
            <Input
              id="sim-card-cvc"
              dir="ltr"
              inputMode="numeric"
              autoComplete="off"
              placeholder="123"
              className="h-9 text-sm font-mono text-start"
              value={cvc}
              onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 4))}
              disabled={busy}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sim-card-holder" className="text-[11px] text-muted-foreground">
            {t("common:invoices_pay_card_holder")}
          </Label>
          <Input
            id="sim-card-holder"
            autoComplete="off"
            placeholder={t("common:invoices_pay_card_holder_placeholder")}
            className="h-9 text-sm"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            disabled={busy}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-full text-[10px] font-semibold text-muted-foreground cursor-pointer"
          onClick={handleFillTestCard}
          disabled={busy}
        >
          {t("common:invoices_pay_fill_test_card")}
        </Button>
      </div>

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
          disabled={busy || !isComplete}
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
    </div>
  );
}

export default SimulatedPaymentForm;
