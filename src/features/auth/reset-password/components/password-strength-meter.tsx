"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const { t } = useTranslation();

  const rules = useMemo(() => {
    return [
      { id: "length", label: "8+ أحرف", passed: password.length >= 8 },
      { id: "uppercase", label: "حرف كبير (A-Z)", passed: /[A-Z]/.test(password) },
      { id: "lowercase", label: "حرف صغير (a-z)", passed: /[a-z]/.test(password) },
      { id: "number", label: "رقم (0-9)", passed: /[0-9]/.test(password) },
      { id: "symbol", label: "رمز خاص (@$!%*?&)", passed: /[@$!%*?&^#()_\-+=]/.test(password) },
    ];
  }, [password]);

  const score = rules.filter((r) => r.passed).length;

  const strengthMeta = useMemo(() => {
    if (!password) return { label: "", colorClass: "bg-border", width: "w-0" };
    if (score <= 1) return { label: t("auth:strengthVeryWeak"), colorClass: "bg-destructive", width: "w-1/5" };
    if (score === 2) return { label: t("auth:strengthWeak"), colorClass: "bg-orange-500", width: "w-2/5" };
    if (score === 3) return { label: t("auth:strengthFair"), colorClass: "bg-amber-500", width: "w-3/5" };
    if (score === 4) return { label: t("auth:strengthStrong"), colorClass: "bg-emerald-500", width: "w-4/5" };
    return { label: t("auth:strengthVeryStrong"), colorClass: "bg-primary", width: "w-full" };
  }, [password, score, t]);

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{t("auth:passwordStrength")}</span>
        <span className="font-bold text-foreground">{strengthMeta.label}</span>
      </div>

      {/* Strength Bar */}
      <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 ${strengthMeta.width} ${strengthMeta.colorClass}`} />
      </div>

      {/* Rules Criteria Grid */}
      <div className="grid grid-cols-2 gap-1 pt-1">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center gap-1.5 text-[10px] ${
              rule.passed ? "text-emerald-500 font-medium" : "text-muted-foreground"
            }`}
          >
            {rule.passed ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : (
              <X className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            )}
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
