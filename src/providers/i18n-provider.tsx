"use client";

import React, { createContext, useContext, useState, useTransition, useEffect } from "react";
import { Locale, Namespace } from "@/types/i18n";
import { getDirection, DICTIONARIES } from "@/lib/i18n";
import { useRouter } from "next/navigation";

interface I18nContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  changeLanguage: (newLocale: Locale) => void;
  isPending: boolean;
  addTranslations: (newTranslations: Record<string, Record<string, string>>) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale,
  initialTranslations = {},
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialTranslations?: Record<string, Record<string, string>>;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(initialTranslations);
  const dir = getDirection(locale);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Sync state if initialLocale changes on the server (e.g. via direct URL or cookie change)
  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  // Sync document element dir and lang on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
    }
  }, [locale, dir]);

  // Sync translations if initialTranslations changes
  useEffect(() => {
    setTranslations((prev) => ({
      ...prev,
      ...initialTranslations,
    }));
  }, [initialTranslations]);

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    // Set persistent locale cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    startTransition(() => {
      setLocaleState(newLocale);
      router.refresh();
    });
  };

  const addTranslations = (newTranslations: Record<string, Record<string, string>>) => {
    setTranslations((prev) => {
      const merged = { ...prev };
      let changed = false;
      Object.keys(newTranslations).forEach((ns) => {
        if (JSON.stringify(prev[ns]) !== JSON.stringify(newTranslations[ns])) {
          merged[ns] = newTranslations[ns];
          changed = true;
        }
      });
      return changed ? merged : prev;
    });
  };

  // Type-safe translation resolution
  const t = (key: string): string => {
    const delimiterIndex = key.indexOf(":");
    let ns = "common";
    let subKey = key;

    if (delimiterIndex !== -1) {
      ns = key.substring(0, delimiterIndex);
      subKey = key.substring(delimiterIndex + 1);
    } else {
      const dotIndex = key.indexOf(".");
      if (dotIndex !== -1) {
        ns = key.substring(0, dotIndex);
        subKey = key.substring(dotIndex + 1);
      }
    }

    return translations[ns]?.[subKey] || DICTIONARIES[locale]?.[ns as Namespace]?.[subKey] || subKey || key;
  };

  return (
    <I18nContext.Provider value={{ locale, dir, t, changeLanguage, isPending, addTranslations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}

/**
 * Hook to dynamically register and load translation namespaces for a page component.
 * Avoids loading all dictionaries globally.
 */
export function useNamespaceTranslations(namespaces: Namespace[]) {
  const { locale, addTranslations } = useTranslation();

  useEffect(() => {
    const loaded: Record<string, Record<string, string>> = {};
    namespaces.forEach((ns) => {
      loaded[ns] = DICTIONARIES[locale][ns] || {};
    });
    addTranslations(loaded);
  }, [locale, namespaces, addTranslations]);
}
