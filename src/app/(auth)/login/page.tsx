"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ShieldAlert, KeyRound, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  
  // Register required translation namespaces for the login page on-demand
  useNamespaceTranslations(["auth", "validation", "dashboard"]);

  const [activeTab, setActiveTab] = useState<"credentials" | "roles">("roles");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Localized Zod validation schema using useMemo for maximum performance
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

  // Redirect to dashboard if session exists
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Handle standard credentials login
  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      // Simulate credential match - mapping email prefix to roles
      if (data.email.includes("admin")) {
        await login("Company Admin");
      } else if (data.email.includes("engineer")) {
        await login("Consulting Engineer");
      } else if (data.email.includes("client")) {
        await login("Client");
      } else {
        await login("Super Admin");
      }
      router.push("/");
    } catch {
      setErrorMsg(t("validation:loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle quick role selector login
  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await login(role);
      router.push("/");
    } catch {
      setErrorMsg(t("validation:authDemoFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleTranslationKey = (role: string) => {
    return `dashboard:role_${role.replace(/\s+/g, "_")}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-xl border-border bg-card/85 backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2 border-b border-border/40 pb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <ShieldAlert className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("auth:title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth:description")}
          </CardDescription>
        </CardHeader>

        {/* Tab Controls */}
        <div className="flex border-b border-border/30">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "roles"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("auth:demoTab")}
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
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
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive font-medium">
              {errorMsg}
            </div>
          )}

          {activeTab === "roles" ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground text-center mb-4">
                {t("auth:roleDemoInstructions")}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    "Super Admin",
                    "Company Admin",
                    "Consulting Engineer",
                    "Operations Officer",
                    "Sales Agent",
                    "Client",
                  ] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleQuickLogin(role)}
                    disabled={isSubmitting}
                    className="flex flex-col items-start p-3 rounded-lg border border-border/60 bg-secondary/50 dark:bg-secondary/20 text-left hover:bg-secondary/80 dark:hover:bg-secondary/40 hover:border-primary/45 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t(getRoleTranslationKey(role))}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t("auth:accessModules")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">{t("auth:emailLabel")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder={t("auth:emailPlaceholder")}
                    {...register("email")}
                    className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">{t("auth:passwordLabel")}</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder={t("auth:passwordPlaceholder")}
                    {...register("password")}
                    className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-muted-foreground/60"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2"
                isLoading={isSubmitting}
              >
                {t("auth:submitBtn")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border/20 pt-4 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            {t("auth:footerNotice")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
