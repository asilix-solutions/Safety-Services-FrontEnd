"use client";

import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Languages } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, changeLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg border border-border/20 bg-secondary/15 relative cursor-pointer"
        >
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 border-border/80 bg-popover">
        <DropdownMenuItem
          onClick={() => changeLanguage("ar")}
          className={`cursor-pointer justify-between ${locale === "ar" ? "font-bold text-primary bg-secondary/20" : ""}`}
        >
          <span>العربية</span>
          <span className="text-[10px] text-muted-foreground">RTL</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={`cursor-pointer justify-between ${locale === "en" ? "font-bold text-primary bg-secondary/20" : ""}`}
        >
          <span>English</span>
          <span className="text-[10px] text-muted-foreground">LTR</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
