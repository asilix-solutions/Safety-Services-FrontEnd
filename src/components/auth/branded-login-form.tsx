"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { UserRole } from "@/types/role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { TenantBadge } from "@/components/auth/tenant-badge";
import { TenantBrandingDTO } from "@/types/tenant";
import {
  KeyRound,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  Wrench,
  Activity,
  User,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface BrandedLoginFormProps {
  tenant?: TenantBrandingDTO | null;
}

export function BrandedLoginForm({ tenant }: BrandedLoginFormProps) {
  const { login, loginWithCredentials, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useNamespaceTranslations(["auth", "validation", "dashboard"]);

  const [activeTab, setActiveTab] = useState<"roles" | "credentials">("roles");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const loginSchema = useMemo(() => {
    return z.object({
      email: z.string().email({ message: t("validation:invalidEmail") || "البريد الإلكتروني غير صالح" }),
      password: z.string().min(6, { message: t("validation:passwordLength") || "كلمة المرور يجب أن لا تقل عن 6 أحرف" }),
    });
  }, [t]);

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const success = await loginWithCredentials({
        email: data.email.trim(),
        password: data.password,
      });
      if (success) {
        router.push("/dashboard");
      }
    } catch {
      setErrorMsg(t("validation:loginFailed") || "فشل تسجيل الدخول. يرجى التحقق من المدخلات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await login(role);
      router.push("/dashboard");
    } catch {
      setErrorMsg(t("validation:authDemoFailed") || "تعذر إتمام الدخول التجريبي.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillCredentials = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
    setActiveTab("credentials");
  };

  const getRoleTranslationKey = (role: string) => {
    return `dashboard:role_${role.replace(/\s+/g, "_")}`;
  };

  const rolesConfig: {
    role: UserRole;
    icon: React.ElementType;
    email: string;
    description: string;
  }[] = [
    {
      role: "Company Admin",
      icon: Building,
      email: "admin@al-salamah.com",
      description: "مدير الشركة (صلاحيات كاملة للمؤسسة)",
    },
    {
      role: "Consulting Engineer",
      icon: Wrench,
      email: "engineer@al-salamah.com",
      description: "المهندس الاستشاري المعتمد (اعتماد المخططات)",
    },
    {
      role: "Operations Officer",
      icon: Activity,
      email: "operations@al-salamah.com",
      description: "مسؤول العمليات الميدانية والمهام",
    },
    {
      role: "Sales Agent",
      icon: UserCheck,
      email: "sales@al-salamah.com",
      description: "مندوب المبيعات واستقبال الطلبات",
    },
    {
      role: "Client",
      icon: User,
      email: "client@al-salamah.com",
      description: "بوابة العميل ومتابعة الطلبات",
    },
    {
      role: "Super Admin",
      icon: ShieldCheck,
      email: "admin@amanix.com",
      description: "المدير العام للمنصة (النظام الموحد)",
    },
  ];

  return (
    <Card className="w-full max-w-xl border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl relative z-10 transition-all">
      <CardHeader className="text-center space-y-2 border-b border-border/40 pb-6">
        <TenantBadge
          tenantName={tenant?.tenantName}
          subdomain={tenant?.tenantSlug}
          logoUrl={tenant?.logoUrl}
        />

        <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {tenant?.tenantName || t("auth:title") || "منصة أمانكس - إدارة تراخيص السلامة"}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          {tenant
            ? "بوابة الدخول الموحدة لمنسوبي وعملاء الشركة المعتمدة"
            : t("auth:description") || "بوابة الدخول الآمن لخدمات الامتثال وهندسة السلامة"}
        </CardDescription>
      </CardHeader>

      {/* Tab Controls */}
      <div className="flex border-b border-border/30">
        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "roles"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("auth:demoTab") || "الحسابات التجريبية السريعة"}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "credentials"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("auth:corporateTab") || "تسجيل الدخول بالبيانات"}</span>
        </button>
      </div>

      <CardContent className="pt-6">
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs sm:text-sm text-destructive font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {activeTab === "roles" ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center mb-4">
              {t("auth:roleDemoInstructions") || "اختر دوراً للدخول الفوري بحسابات الاختبار المجهزة على خادم Staging:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rolesConfig.map(({ role, icon: Icon, email, description }) => (
                <div
                  key={role}
                  className="flex flex-col justify-between p-3.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/50 transition-all text-start group relative"
                >
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(role)}
                    disabled={isSubmitting}
                    className="w-full text-start cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {t(getRoleTranslationKey(role)) || role}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                      {description}
                    </p>
                    <span className="font-mono text-[10px] text-primary/80 block">
                      {email}
                    </span>
                  </button>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/30">
                    <button
                      type="button"
                      onClick={() => handleFillCredentials(email, "User@123456")}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      تعبئة البيانات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(role)}
                      disabled={isSubmitting}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>دخول سريع</span>
                      <ArrowRight className="h-2.5 w-2.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("auth:emailLabel") || "البريد الإلكتروني"}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  dir="ltr"
                  placeholder={t("auth:emailPlaceholder") || "admin@al-salamah.com"}
                  {...register("email")}
                  className="w-full bg-background/60 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("auth:passwordLabel") || "كلمة المرور"}
              </label>
              <div className="relative">
                <KeyRound className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  placeholder={t("auth:passwordPlaceholder") || "••••••••"}
                  {...register("password")}
                  className="w-full bg-background/60 border border-border rounded-lg ps-10 pe-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-start"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute end-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline transition-colors"
              >
                {t("auth:forgotPasswordLink") || "نسيت كلمة المرور؟"}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 h-11 cursor-pointer"
              isLoading={isSubmitting}
            >
              <span>{t("auth:submitBtn") || "تسجيل الدخول"}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 justify-center border-t border-border/30 pt-4 text-center">
        <Link
          href="/register-company"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{t("auth:registerCompanyLink") || "تسجيل منشأة جديدة في المنصة"}</span>
        </Link>
        <p className="text-[11px] text-muted-foreground">
          {t("auth:footerNotice") || "محمي بأنظمة التشفير المتطورة ومطابق لاشتراطات الدفاع المدني وهيئة الزكاة والضريبة والجمارك"}
        </p>
      </CardFooter>
    </Card>
  );
}
