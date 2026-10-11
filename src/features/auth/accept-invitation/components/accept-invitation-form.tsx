"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { TenantBadge } from "@/components/auth/tenant-badge";
import { TenantBrandingDTO } from "@/types/tenant";
import { authApi } from "@/domains/auth";
import { alertService } from "@/services/alert-service";
import { setAuthSession } from "@/lib/auth-storage";
import { Lock, ArrowRight, UserCheck, Eye, EyeOff } from "lucide-react";

interface AcceptInvitationFormProps {
  tenant?: TenantBrandingDTO | null;
}

const acceptSchema = z
  .object({
    password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

type AcceptFormValues = z.infer<typeof acceptSchema>;

export function AcceptInvitationForm({ tenant }: AcceptInvitationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const token = searchParams.get("token") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AcceptFormValues) => {
    if (!userId || !token) {
      alertService.error("رابط الدعوة غير مكتمل أو غير صالح. يرجى التأكد من الرابط المستلم في البريد.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.acceptTenantInvitation({
        userId,
        invitationToken: token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (res.isSuccess && res.data) {
        setAuthSession({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });

        alertService.success("تم تفعيل حسابك وتعيين كلمة المرور بنجاح!", {
          description: "مرحباً بك في فريق العمل، جاري توجيهك إلى لوحة التحكم...",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        alertService.showApiResponse(res, {
          defaultError: "فشل تفعيل الدعوة. قد يكون الرابط منتهي الصلاحية.",
        });
      }
    } catch (err) {
      alertService.showApiError(err, { fallbackMessage: "تعذر قبول الدعوة وتعيين كلمة المرور." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border/60 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden rounded-2xl">
      <CardHeader className="text-center pb-2 pt-6">
        <TenantBadge
          tenantName={tenant?.tenantName}
          subdomain={tenant?.tenantSlug}
          logoUrl={tenant?.logoUrl}
        />
        <div className="flex justify-center mt-3">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground mt-3">
          قبول دعوة الانضمام لفريق العمل
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          قم بتعيين كلمة المرور الخاصة بك للبدء في استخدام المنصة
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        {!userId || !token ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
            <p className="text-xs text-destructive font-bold">
              معلومات الدعوة غير متوفرة في الرابط (userId أو token مفقود).
            </p>
            <p className="text-[11px] text-muted-foreground">
              يرجى التحقق من الرابط الذي وصلك عبر البريد الإلكتروني أو طلب دعوة جديدة من مدير المنشأة.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>كلمة المرور الجديدة</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-background/60 border border-border rounded-lg ps-3 pe-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>تأكيد كلمة المرور الجديدة</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 h-11 cursor-pointer"
              isLoading={isSubmitting}
            >
              <span>تعيين كلمة المرور وتفعيل الحساب</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/30 pt-4 text-center">
        <Link href="/login" className="text-xs font-bold text-primary hover:underline">
          العودة لصفحة تسجيل الدخول
        </Link>
      </CardFooter>
    </Card>
  );
}
