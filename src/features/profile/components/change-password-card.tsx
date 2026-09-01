"use client";

import React from "react";
import { Lock, KeyRound, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useChangePassword } from "../hooks/use-change-password";
import { PasswordStrengthMeter } from "@/features/auth/reset-password";

export function ChangePasswordCard() {
  const { form, onSubmit, isSubmitting, errorMsg, t } = useChangePassword();
  const { register, watch, formState: { errors } } = form;
  const newPasswordValue = watch("newPassword");

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <KeyRound className="h-4.5 w-4.5 text-primary" />
          <span>تحديث كلمة المرور والأمان</span>
        </CardTitle>
        <CardDescription className="text-xs">
          قم بتحديث كلمة المرور الخاصة بحسابك لضمان أعلى معايير الأمان.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              كلمة المرور الحالية
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••••••"
                {...register("currentPassword")}
                className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.currentPassword.message ? t(errors.currentPassword.message) : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive font-medium">
                  {errors.newPassword.message ? t(errors.newPassword.message) : ""}
                </p>
              )}
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
                  className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">
                  {errors.confirmPassword.message ? t(errors.confirmPassword.message) : ""}
                </p>
              )}
            </div>
          </div>

          <PasswordStrengthMeter password={newPasswordValue} />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              className="gap-2 font-bold"
              isLoading={isSubmitting}
            >
              <span>حفظ وتحديث كلمة المرور</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
