import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { getNamespaceDictionaries } from "@/lib/i18n";
import { Locale } from "@/types/i18n";
import { Toaster } from "@/shared/ui/sonner";
import { PointerEventsGuard } from "@/providers/pointer-events-guard";
import { TenantThemeInjector } from "@/components/theming/tenant-theme-injector";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safety Services & Licensing Management Platform",
  description: "Enterprise SaaS platform for safety engineering compliance, blueprint reviews, and permit management.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Preload primary namespaces for top-level pages
  const initialTranslations = getNamespaceDictionaries(locale, [
    "common",
    "validation",
    "dashboard",
    "requests",
    "marketing",
  ]);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <TenantThemeInjector />
      </head>
      <body
        className={`${ibmPlexArabic.variable} ${geistMono.variable} antialiased font-sans min-h-screen bg-background text-foreground transition-colors duration-200`}
      >
        <QueryProvider>
          <I18nProvider initialLocale={locale} initialTranslations={initialTranslations}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                {children}
              </AuthProvider>
              <Toaster />
              <PointerEventsGuard />
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
