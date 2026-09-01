"use client";

import React from "react";
import Link from "next/link";
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useResetPassword } from "../hooks/use-reset-password";
import { OtpInputGroup } from "./otp-input-group";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { TenantBrandingDTO } from "@/types/tenant";
import { TenantBadge } from "@/components/auth/tenant-badge";

interface ResetPasswordFormProps {
  tenant?: TenantBrandingDTO | null;
}

export function ResetPasswordForm({ tenant }: ResetPasswordFormProps) {
  const {
    form,
    onSubmit,
    isSubmitting,
    errorMsg,
    resendCooldown,
    handleResendOtp,
    t,
  } = useResetPassword();

  const { register, watch, setValue, formState: { errors } } = form;
  const passwordValue = watch("newPassword");
  const otpValue = watch("otp");

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
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {t("auth:resetPasswordTitle")}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {t("auth:resetPasswordDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs sm:text-sm text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email (Readonly if passed from query) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("auth:emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                {...register("email")}
                placeholder={t("auth:emailPlaceholder")}
                className="w-full bg-muted/40 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">
                {errors.email.message ? t(errors.email.message) : ""}
              </p>
            )}
          </div>

          {/* 6-Digit OTP Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                {t("auth:otpLabel")}
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-[11px] text-primary hover:underline disabled:text-muted-foreground cursor-pointer disabled:cursor-not-allowed font-medium"
              >
                {resendCooldown > 0
                  ? `${t("auth:resendCountdown")} (${resendCooldown}s)`
                  : t("auth:resendBtn")}
              </button>
            </div>

            <OtpInputGroup
              value={otpValue || ""}
              onChange={(val) => setValue("otp", val, { shouldValidate: true })}
            />
            {errors.otp && (
              <p className="text-xs text-destructive font-medium text-center">
                {errors.otp.message ? t(errors.otp.message) : ""}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("auth:newPasswordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("auth:newPasswordPlaceholder")}
                {...register("newPassword")}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.newPassword.message ? t(errors.newPassword.message) : ""}
              </p>
            )}

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("auth:confirmPasswordLabel")}
            </label>
            <div className="relative">
              <KeyRound className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("auth:confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.confirmPassword.message ? t(errors.confirmPassword.message) : ""}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 h-11"
            isLoading={isSubmitting}
          >
            <span>{t("auth:resetPasswordBtn")}</span>
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
