"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { TenantBadge } from "@/components/auth/tenant-badge";
import { TenantBrandingDTO } from "@/types/tenant";
import { authApi } from "@/domains/auth";
import { alertService } from "@/services/alert-service";
import { OtpInputGroup } from "@/features/auth/reset-password";
import { setAuthSession } from "@/lib/auth-storage";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

interface RegisterClientFormProps {
  tenant?: TenantBrandingDTO | null;
}

const registerSchema = z
  .object({
    fullName: z.string().min(3, "الاسم الكامل يجب ألا يقل عن 3 أحرف"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phoneNumber: z.string().min(10, "رقم الجوال يجب أن يتكون من 10 أرقام على الأقل"),
    password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterClientForm({ tenant }: RegisterClientFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmitRegistration = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await authApi.registerClient({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phoneNumber: data.phoneNumber.trim(),
        password: data.password,
      });

      if (res.isSuccess && res.data) {
        setRegisteredUserId(res.data.userId);
        if (res.data.devOnlyOtp) {
          setDevOtp(res.data.devOnlyOtp);
          setOtpCode(res.data.devOnlyOtp);
          alertService.success("تم إرسال رمز التحقق OTP بنجاح!", {
            description: `رمز التحقق التجريبي: ${res.data.devOnlyOtp}`,
            duration: 8000,
          });
        } else {
          alertService.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
        }
        setStep("otp");
      } else {
        alertService.showApiResponse(res, {
          defaultError: "فشل إنشاء حساب العميل. يرجى التحقق من المدخلات.",
        });
      }
    } catch (err) {
      alertService.showApiError(err, { fallbackMessage: "تعذر إكمال عملية التسجيل." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!registeredUserId || otpCode.length < 6) return;
    setIsSubmitting(true);
    try {
      const res = await authApi.verifyClientOtp({
        userId: registeredUserId,
        otp: otpCode.trim(),
      });

      if (res.isSuccess && res.data) {
        setAuthSession({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });

        alertService.success("تم تفعيل حساب العميل بنجاح!", {
          description: "مرحباً بك في بوابة المستفيدين، جاري تحويلك إلى لوحة التحكم...",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        alertService.showApiResponse(res, {
          defaultError: "رمز التحقق غير صحيح أو منتهي الصلاحية.",
        });
      }
    } catch (err) {
      alertService.showApiError(err, { fallbackMessage: "فشل التحقق من رمز OTP." });
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
        <CardTitle className="text-xl font-bold tracking-tight text-foreground mt-3">
          {step === "form" ? "إنشاء حساب مستفيد / عميل" : "التحقق من رمز OTP"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {step === "form"
            ? "سجّل بياناتك للاستفادة من خدمات تراخيص واعتمادات الدفاع المدني"
            : `أدخل رمز التحقق المرسل إلى: ${getValues("email")}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        {step === "form" ? (
          <form onSubmit={handleSubmit(onSubmitRegistration)} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>الاسم الكامل</span>
              </label>
              <input
                type="text"
                placeholder="أحمد محمد الشهري"
                {...register("fullName")}
                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
              />
              {errors.fullName && (
                <p className="text-[11px] text-destructive font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>البريد الإلكتروني</span>
              </label>
              <input
                type="email"
                placeholder="client@domain.com"
                dir="ltr"
                {...register("email")}
                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start font-mono"
              />
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>رقم الجوال</span>
              </label>
              <input
                type="tel"
                placeholder="05XXXXXXXX"
                dir="ltr"
                {...register("phoneNumber")}
                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start font-mono"
              />
              {errors.phoneNumber && (
                <p className="text-[11px] text-destructive font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>كلمة المرور</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-background/60 border border-border rounded-lg ps-3 pe-10 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
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
                <span>تأكيد كلمة المرور</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 h-10 cursor-pointer"
              isLoading={isSubmitting}
            >
              <span>متابعة والتسجيل</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </form>
        ) : (
          <div className="space-y-5 py-2">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            {devOtp && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <span className="text-xs text-muted-foreground block">رمز التحقق التجريبي (OTP):</span>
                <span className="text-base font-bold font-mono text-primary tracking-widest">{devOtp}</span>
              </div>
            )}

            <div className="flex justify-center" dir="ltr">
              <OtpInputGroup value={otpCode} onChange={setOtpCode} disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Button
                onClick={onVerifyOtp}
                disabled={otpCode.length < 6 || isSubmitting}
                isLoading={isSubmitting}
                className="w-full h-10 font-bold gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>تأكيد الرمز وتفعيل الحساب</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("form")}
                className="w-full text-xs text-muted-foreground cursor-pointer"
              >
                الرجوع لتعديل البيانات
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 justify-center border-t border-border/30 pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
