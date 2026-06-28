"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { useTranslation } from "@/providers/i18n-provider";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  align?: "start" | "end" | "center";
  disabled?: boolean;
}

export function ActionMenu({
  items,
  label,
  align = "end",
  disabled = false,
}: ActionMenuProps) {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const triggerLabel = label || t("common:actions_open_menu") || "Open actions menu";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted p-0 cursor-pointer"
          aria-label={triggerLabel}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48 bg-card border-border shadow-md">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex items-center w-full gap-2 text-start justify-start">
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </div>
          );

          const itemClass = item.destructive
            ? "text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs"
            : "cursor-pointer text-xs";

          return (
            <React.Fragment key={item.id}>
              {item.separatorBefore && <DropdownMenuSeparator />}
              {item.href ? (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  disabled={item.disabled}
                  className={itemClass}
                >
                  <Link href={item.href} className="w-full">
                    {content}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={item.id}
                  disabled={item.disabled}
                  onClick={item.onClick}
                  className={itemClass}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
