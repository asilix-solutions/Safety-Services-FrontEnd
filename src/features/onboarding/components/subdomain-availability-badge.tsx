"use client";

import React from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { SubdomainAvailabilityState } from "../hooks/use-subdomain-check";

interface SubdomainAvailabilityBadgeProps {
  state: SubdomainAvailabilityState;
  message: string;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function SubdomainAvailabilityBadge({
  state,
  message,
  suggestions,
  onSelectSuggestion,
}: SubdomainAvailabilityBadgeProps) {
  if (state === "idle") return null;

  return (
    <div className="space-y-2 pt-1 text-xs">
      <div
        className={`flex items-center gap-1.5 font-medium ${
          state === "available"
            ? "text-emerald-600 dark:text-emerald-400"
            : state === "unavailable"
            ? "text-destructive"
            : state === "checking"
            ? "text-primary"
            : "text-amber-600 dark:text-amber-400"
        }`}
      >
        {state === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {state === "available" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
        {state === "unavailable" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
        {state === "invalid" && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
        <span>{message}</span>
      </div>

      {/* Suggested alternatives */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground">اقتراحات بديلة:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onSelectSuggestion(sug)}
              className="px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-primary/10 hover:text-primary border border-border text-[11px] font-mono transition-colors cursor-pointer"
            >
              {sug}.sslm.sa
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
