"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  score: number;
  description: string;
  className?: string;
}

export function KpiCard({ title, score, description, className }: KpiCardProps) {
  // SVG circular properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between py-2">
        <div className="space-y-1 w-2/3">
          <div className="text-3xl font-extrabold">{score}%</div>
          <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
        </div>
        
        {/* SVG Progress Circle */}
        <div className="relative flex items-center justify-center">
          <svg className="h-20 w-20 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-muted fill-none"
              strokeWidth="6"
            />
            {/* Active progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className={cn(
                "fill-none transition-all duration-500",
                score >= 90
                  ? "stroke-success"
                  : score >= 80
                  ? "stroke-warning"
                  : "stroke-destructive"
              )}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-muted-foreground uppercase">
            SLA OK
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
export default KpiCard;
