"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useForgotPassword } from "../hooks/use-forgot-password";
import { TenantBrandingDTO } from "@/types/tenant";
import { TenantBadge } from "@/components/auth/tenant-badge";

interface ForgotPasswordFormProps {
  tenant?: TenantBrandingDTO | null;
}

export function ForgotPasswordForm({ tenant }: ForgotPasswordFormProps) {
  const { form, onSubmit, isSubmitting, errorMsg, t } = useForgotPassword();
  const { register, formState: { errors } } = form;

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl relative z-10">
      <CardHeader className="text-center space-y-2 border-b border-border/40 pb-6">
        <TenantBadge
          tenantName={tenant?.tenantName}
          subdomain={tenant?.tenantSlug}
          logoUrl={tenant?.logoUrl}
        />

        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>

        <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {t("auth:forgotPasswordTitle")}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {t("auth:forgotPasswordDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs sm:text-sm text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("auth:emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder={t("auth:emailPlaceholder")}
                {...register("email")}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">
                {errors.email.message ? t(errors.email.message) : ""}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 h-11"
            isLoading={isSubmitting}
          >
            <span>{t("auth:sendOtpBtn")}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/30 pt-4 text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>{t("auth:backToLogin")}</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
