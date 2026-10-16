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

import { getServerTenantBranding } from "@/lib/server-tenant";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getServerTenantBranding();
  const tenantName = branding?.tenantName || "منصة أمانكس لخدمات وتراخيص السلامة";
  const title = branding?.seoTitle || tenantName;
  const description =
    branding?.seoDescription ||
    (branding?.tenantName
      ? `بوابة حلول وأنظمة السلامة الهندسية وتراخيص كود البناء السعودي - ${branding.tenantName}`
      : "المنصة السحابية الموحدة لخدمات السلامة وتراخيص الدفاع المدني والاعتماد الهندسي.");
  const iconUrl = branding?.faviconUrl || branding?.logoUrl || "/favicon.ico";
  const ogTitle = branding?.ogTitle || title;
  const ogDescription = branding?.ogDescription || description;
  const ogImageUrl = branding?.ogImage || branding?.logoUrl;
  const keywords = branding?.seoKeywords
    ? branding.seoKeywords.split(",").map((k) => k.trim())
    : ["سلامة", "دفاع مدني", "كود البناء السعودي", "أمانكس", tenantName];

  return {
    title: {
      default: title,
      template: `%s | ${tenantName}`,
    },
    description,
    keywords,
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
    alternates: branding?.canonicalUrl ? { canonical: branding.canonicalUrl } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: (branding?.ogType as any) || "website",
    },
    twitter: {
      card: (branding?.twitterCard as any) || "summary_large_image",
      site: branding?.twitterSite || undefined,
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

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
