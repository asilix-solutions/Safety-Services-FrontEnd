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
} from "lucide-react";

interface BrandedLoginFormProps {
  tenant?: TenantBrandingDTO | null;
}

export function BrandedLoginForm({ tenant }: BrandedLoginFormProps) {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useNamespaceTranslations(["auth", "validation", "dashboard"]);

  const [activeTab, setActiveTab] = useState<"roles" | "credentials">("roles");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const loginSchema = useMemo(() => {
    return z.object({
      email: z.string().email({ message: t("validation:invalidEmail") }),
      password: z.string().min(6, { message: t("validation:passwordLength") }),
    });
  }, [t]);

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
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
      if (data.email.includes("admin")) {
        await login("Company Admin");
      } else if (data.email.includes("engineer")) {
        await login("Consulting Engineer");
      } else if (data.email.includes("client")) {
        await login("Client");
      } else {
        await login("Super Admin");
      }
      router.push("/dashboard");
    } catch {
      setErrorMsg(t("validation:loginFailed"));
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
      setErrorMsg(t("validation:authDemoFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleTranslationKey = (role: string) => {
    return `dashboard:role_${role.replace(/\s+/g, "_")}`;
  };

  const rolesConfig: { role: UserRole; icon: React.ElementType }[] = [
    { role: "Super Admin", icon: ShieldCheck },
    { role: "Company Admin", icon: Building },
    { role: "Consulting Engineer", icon: Wrench },
    { role: "Operations Officer", icon: Activity },
    { role: "Sales Agent", icon: UserCheck },
    { role: "Client", icon: User },
  ];

  return (
    <Card className="w-full max-w-xl border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl relative z-10">
      <CardHeader className="text-center space-y-2 border-b border-border/40 pb-6">
        <TenantBadge
          tenantName={tenant?.tenantName}
          subdomain={tenant?.tenantSlug}
          logoUrl={tenant?.logoUrl}
        />

        <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {tenant?.tenantName || t("auth:title")}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          {tenant
            ? "بوابة الدخول الموحدة لمنسوبي وعملاء الشركة"
            : t("auth:description")}
        </CardDescription>
      </CardHeader>

      {/* Tab Controls */}
      <div className="flex border-b border-border/30">
        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "roles"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("auth:demoTab")}
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
          {t("auth:corporateTab")}
        </button>
      </div>

      <CardContent className="pt-6">
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs sm:text-sm text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        {activeTab === "roles" ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center mb-4">
              {t("auth:roleDemoInstructions")}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {rolesConfig.map(({ role, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickLogin(role)}
                  disabled={isSubmitting}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary/70 hover:border-primary/50 transition-all cursor-pointer group text-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {t(getRoleTranslationKey(role))}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {t("auth:accessModules")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("auth:passwordLabel")}
              </label>
              <div className="relative">
                <KeyRound className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder={t("auth:passwordPlaceholder")}
                  {...register("password")}
                  className="w-full bg-background/50 border border-border rounded-lg ps-10 pe-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
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
                {t("auth:forgotPasswordLink")}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 h-11"
              isLoading={isSubmitting}
            >
              <span>{t("auth:submitBtn")}</span>
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
          <span>{t("auth:registerCompanyLink")}</span>
        </Link>
        <p className="text-[11px] text-muted-foreground">
          {t("auth:footerNotice")}
        </p>
      </CardFooter>
    </Card>
  );
}

