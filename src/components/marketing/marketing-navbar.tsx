"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";
import {
  ShieldAlert,
  ShieldCheck,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function MarketingNavbar() {
  const { t, locale, changeLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    changeLanguage(nextLocale);
  };

  const navLinks = [
    { href: "#features", label: t("marketing:nav_features") },
    { href: "#showcase", label: t("marketing:nav_modules") },
    { href: "#pricing", label: t("marketing:nav_pricing") },
    { href: "#faq", label: t("marketing:nav_faq") },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
        >
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
            <ShieldAlert className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              SSLM
            </span>
            <span className="text-[11px] font-medium text-muted-foreground -mt-1 hidden sm:inline-block">
              {locale === "ar" ? "منصة خدمات السلامة والتراخيص" : "Safety Services & Licensing"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls & Authentication Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-xs font-semibold flex items-center gap-1.5 px-2.5 h-9 rounded-lg hover:bg-secondary/70"
            title="Switch Language"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{locale === "ar" ? "EN" : "عربي"}</span>
          </Button>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-secondary/70"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 text-xs">
                <Sun className="h-3.5 w-3.5" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 text-xs">
                <Moon className="h-3.5 w-3.5" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 text-xs">
                <Laptop className="h-3.5 w-3.5" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth State Button */}
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-2 font-semibold shadow-md shadow-primary/20">
                <LayoutDashboard className="h-4 w-4" />
                <span>{t("marketing:nav_dashboard")}</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold gap-1.5 text-xs">
                  <LogIn className="h-4 w-4 text-muted-foreground" />
                  <span>{t("marketing:nav_login")}</span>
                </Button>
              </Link>
              <Link href="/register-company">
                <Button size="sm" className="font-semibold gap-2 shadow-md shadow-primary/25">
                  <span>{t("marketing:nav_get_started")}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-xs font-semibold px-2 h-8"
          >
            {locale === "ar" ? "EN" : "عربي"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10 rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/80 px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-foreground/80 hover:text-primary py-2 border-b border-border/30"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center gap-2 font-semibold">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t("marketing:nav_dashboard")}</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center gap-2 font-semibold">
                    <LogIn className="h-4 w-4" />
                    <span>{t("marketing:nav_login")}</span>
                  </Button>
                </Link>
                <Link href="/register-company" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center gap-2 font-semibold shadow-md shadow-primary/20">
                    <span>{t("marketing:nav_get_started")}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
