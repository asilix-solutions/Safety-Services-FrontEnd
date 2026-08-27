"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  ShieldCheck,
  ArrowRight,
  Flame,
  Wind,
  BellRing,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  Building2,
  Award,
} from "lucide-react";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 dark:bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 start-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Compliance Badge */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>{t("marketing:badge_compliance")}</span>
            <Sparkles className="h-3.5 w-3.5 text-primary/70" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] sm:leading-[1.15]">
            <span>{t("marketing:hero_title_prefix")} </span>
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              {t("marketing:hero_title_highlight")}
            </span>
            <br className="hidden sm:inline" />
            <span className="text-foreground/90"> {t("marketing:hero_title_suffix")}</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl font-normal">
            {t("marketing:hero_description")}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
            <Link href="/register-company" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base font-bold gap-2.5 shadow-xl shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>{t("marketing:hero_cta_primary")}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base font-semibold border-border/80 bg-card/60 backdrop-blur-md hover:bg-card hover:border-primary/50 transition-all cursor-pointer"
              >
                <span>{t("marketing:hero_cta_secondary")}</span>
              </Button>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 w-full max-w-4xl border-t border-border/40 mt-8">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-card/40 border border-border/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-black text-primary">
                {t("marketing:hero_stat_firms")}
              </span>
              <span className="text-xs text-muted-foreground font-medium text-center mt-0.5">
                {t("marketing:hero_stat_firms_label")}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-card/40 border border-border/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {t("marketing:hero_stat_sites")}
              </span>
              <span className="text-xs text-muted-foreground font-medium text-center mt-0.5">
                {t("marketing:hero_stat_sites_label")}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-card/40 border border-border/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-black text-primary">
                {t("marketing:hero_stat_sla")}
              </span>
              <span className="text-xs text-muted-foreground font-medium text-center mt-0.5">
                {t("marketing:hero_stat_sla_label")}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-card/40 border border-border/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {t("marketing:hero_stat_savings")}
              </span>
              <span className="text-xs text-muted-foreground font-medium text-center mt-0.5">
                {t("marketing:hero_stat_savings_label")}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Glassmorphic Workspace Preview Mockup */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-primary/10 overflow-hidden relative">
            {/* Top Mock Window Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-accent/60" />
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <span className="text-xs font-semibold text-muted-foreground ms-2">
                  SSLM Enterprise Workspace • Apex Safety Solutions
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>{t("marketing:preview_status_live")}</span>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Silo 1: Alarm System */}
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/15 text-primary">
                      <BellRing className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {t("marketing:preview_alarm")}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">NFPA 72 & SBC 801</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                    100% تدقيق
                  </Badge>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">اكتمال المخطط:</span>
                    <span className="text-foreground font-semibold">24 لوحة إنذار معتمدة</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full rounded-full" />
                  </div>
                </div>
              </div>

              {/* Silo 2: Fire Suppression */}
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-accent/15 text-accent">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {t("marketing:preview_suppression")}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">NFPA 13 & FM200</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20">
                    قيد الفحص
                  </Badge>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">شبكة الرش الآلي:</span>
                    <span className="text-foreground font-semibold">180 بار ضغط هيدروليكي</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-4/5 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Silo 3: Smoke Control & Ventilation */}
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/15 text-primary">
                      <Wind className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {t("marketing:preview_ventilation")}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">NFPA 92 & سلامة السلالم</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                    جاهز للاعتماد
                  </Badge>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">مراوح سحب الدخان:</span>
                    <span className="text-foreground font-semibold">12 مروحة مطابقة</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[95%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Banner */}
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{t("marketing:preview_stage_current")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>الرياض - مجمع الأعمال الشمالي (GPS مفعّل)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
