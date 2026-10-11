import { useState, useEffect } from "react";
import { SUBDOMAIN_REGEX } from "@/schemas/onboarding.schema";
import { tenantOnboardingApi } from "@/domains/tenants";

const RESERVED_AND_TAKEN_SUBDOMAINS = [
  "app",
  "api",
  "admin",
  "www",
  "staging",
  "mail",
  "portal",
  "vertex",
  "safetyshield",
  "gulffire",
  "redsea",
];

export type SubdomainAvailabilityState = "idle" | "checking" | "available" | "unavailable" | "invalid";

export function useSubdomainCheck(subdomain: string) {
  const [state, setState] = useState<SubdomainAvailabilityState>("idle");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const trimmed = subdomain.trim().toLowerCase();

    if (!trimmed) {
      setState("idle");
      setMessage("");
      setSuggestions([]);
      return;
    }

    if (trimmed.length < 3) {
      setState("invalid");
      setMessage("النطاق الفرعي يجب ألا يقل عن 3 أحرف.");
      setSuggestions([]);
      return;
    }

    if (!SUBDOMAIN_REGEX.test(trimmed)) {
      setState("invalid");
      setMessage("صيغة غير صالحة. يسمح بالأحرف الإنجليزية والأرقام والشرطات فقط.");
      setSuggestions([]);
      return;
    }

    setState("checking");
    setMessage("جاري التحقق من توفر النطاق عبر الخادم...");

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await tenantOnboardingApi.checkSubdomainAvailability(trimmed);
        if (isCancelled) return;

        if (res.isSuccess && res.data) {
          if (res.data.isAvailable) {
            setState("available");
            setMessage(res.data.message || "هذا النطاق متاح للاستخدام الفوري! ✓");
            setSuggestions([]);
          } else {
            setState("unavailable");
            setMessage(res.data.message || "هذا النطاق الفرعي محجوز بالفعل. يرجى اختيار اسم آخر.");
            setSuggestions([`${trimmed}-sa`, `${trimmed}-safety`, `${trimmed}app`, `sa-${trimmed}`]);
          }
          return;
        }
      } catch {
        // Fallback to local check if backend is unreachable
      }

      if (isCancelled) return;
      const isTaken = RESERVED_AND_TAKEN_SUBDOMAINS.includes(trimmed);
      if (isTaken) {
        setState("unavailable");
        setMessage("هذا النطاق الفرعي محجوز بالفعل. يرجى اختيار اسم آخر أو اختيار اقتراح أدناه.");
        setSuggestions([`${trimmed}-sa`, `${trimmed}-safety`, `${trimmed}app`, `sa-${trimmed}`]);
      } else {
        setState("available");
        setMessage("هذا النطاق متاح للاستخدام الفوري! ✓");
        setSuggestions([]);
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [subdomain]);

  return {
    state,
    message,
    suggestions,
  };
}
