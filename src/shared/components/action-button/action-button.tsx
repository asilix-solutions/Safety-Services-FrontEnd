"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export interface ActionButtonProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ActionButton({
  label,
  icon: Icon,
  href,
  onClick,
  disabled = false,
  destructive = false,
  variant = "outline",
  size = "sm",
  className,
}: ActionButtonProps) {
  const content = (
    <>
      {Icon && <Icon className="h-3.5 w-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 shrink-0" />}
      <span>{label}</span>
    </>
  );

  const buttonVariant = destructive ? "destructive" : variant;

  if (href) {
    return (
      <Button
        asChild
        variant={buttonVariant}
        size={size}
        disabled={disabled}
        className={className}
      >
        <Link href={href}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={buttonVariant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {content}
    </Button>
  );
}
