"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export function PricingAndPlans() {
  const { t } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: "starter",
      name: t("marketing:plan_starter_name"),
      desc: t("marketing:plan_starter_desc"),
      price: isAnnual
        ? t("marketing:plan_starter_price_annual")
        : t("marketing:plan_starter_price_monthly"),
      period: isAnnual ? t("marketing:per_month") : t("marketing:per_month"),
      popular: false,
      features: [
        t("marketing:plan_starter_f1"),
        t("marketing:plan_starter_f2"),
        t("marketing:plan_starter_f3"),
        t("marketing:plan_starter_f4"),
        t("marketing:plan_starter_f5"),
      ],
      ctaText: t("marketing:btn_select_plan"),
      ctaVariant: "outline" as const,
    },
    {
      id: "professional",
      name: t("marketing:plan_pro_name"),
      desc: t("marketing:plan_pro_desc"),
      price: isAnnual
        ? t("marketing:plan_pro_price_annual")
        : t("marketing:plan_pro_price_monthly"),
      period: isAnnual ? t("marketing:per_month") : t("marketing:per_month"),
      popular: true,
      features: [
        t("marketing:plan_pro_f1"),
        t("marketing:plan_pro_f2"),
        t("marketing:plan_pro_f3"),
        t("marketing:plan_pro_f4"),
        t("marketing:plan_pro_f5"),
        t("marketing:plan_pro_f6"),
        t("marketing:plan_pro_f7"),
      ],
      ctaText: t("marketing:btn_select_plan"),
      ctaVariant: "default" as const,
    },
    {
      id: "enterprise",
      name: t("marketing:plan_enterprise_name"),
      desc: t("marketing:plan_enterprise_desc"),
      price: isAnnual
        ? t("marketing:plan_enterprise_price_annual")
        : t("marketing:plan_enterprise_price_monthly"),
      period: isAnnual ? t("marketing:per_month") : t("marketing:per_month"),
      popular: false,
      features: [
        t("marketing:plan_enterprise_f1"),
        t("marketing:plan_enterprise_f2"),
        t("marketing:plan_enterprise_f3"),
        t("marketing:plan_enterprise_f4"),
        t("marketing:plan_enterprise_f5"),
        t("marketing:plan_enterprise_f6"),
      ],
      ctaText: t("marketing:btn_contact_sales"),
      ctaVariant: "outline" as const,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative bg-secondary/15 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("marketing:pricing_badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            {t("marketing:pricing_title")}
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground font-normal">
            {t("marketing:pricing_subtitle")}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-xl bg-card border border-border/80 shadow-sm mt-6">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("marketing:pricing_monthly")}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isAnnual
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("marketing:pricing_annual")}</span>
              <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-black uppercase">
                {t("marketing:pricing_annual_discount")}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-primary bg-card shadow-2xl shadow-primary/10 scale-105 z-10"
                  : "border-border/60 bg-card/75 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 start-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-black px-4 py-1 text-xs shadow-md shadow-primary/30 uppercase tracking-wide">
                    {t("marketing:popular_badge")}
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-2xl font-black text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground min-h-[32px]">
                  {plan.desc}
                </CardDescription>

                <div className="pt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-foreground">{plan.price}</span>
                  <span className="text-base font-bold text-muted-foreground">
                    {t("marketing:currency")}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <div className="h-px bg-border/60 mb-4" />
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                      <div className="p-0.5 rounded-full bg-primary/15 text-primary shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Link
                  href={`/register-company?plan=${plan.id}&billing=${isAnnual ? "annual" : "monthly"}`}
                  className="w-full"
                >
                  <Button
                    variant={plan.ctaVariant}
                    className={`w-full h-11 font-bold gap-2 cursor-pointer ${
                      plan.popular ? "shadow-lg shadow-primary/25" : ""
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
