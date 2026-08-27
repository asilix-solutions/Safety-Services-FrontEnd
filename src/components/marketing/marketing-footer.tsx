"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { ShieldAlert, ShieldCheck, Mail, Phone, MapPin, Lock } from "lucide-react";

export function MarketingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border/70 text-foreground pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/40">
          {/* Brand & Saudi Compliance Summary */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <ShieldAlert className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">SSLM</span>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t("marketing:footer_compliance_notice")}
            </p>

            {/* Official Saudi Business Compliance Badges */}
            <div className="pt-2 space-y-1.5 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{t("marketing:footer_cr")}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{t("marketing:footer_vat")}</span>
              </div>
            </div>
          </div>

          {/* Column: Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t("marketing:footer_col_platform")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  {t("marketing:nav_features")}
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-primary transition-colors">
                  {t("marketing:nav_modules")}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  {t("marketing:nav_pricing")}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  {t("marketing:nav_faq")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t("marketing:footer_col_legal")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  {t("marketing:footer_link_terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  {t("marketing:footer_link_privacy")}
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-primary transition-colors">
                  {t("marketing:footer_link_security")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t("marketing:footer_col_contact")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{t("marketing:footer_address")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span dir="ltr">{t("marketing:footer_phone")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>{t("marketing:footer_email")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Security Encrypted Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{t("marketing:footer_rights")}</p>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-Bit SSL Encrypted • Saudi Vision 2030 Aligned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
