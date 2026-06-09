"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface AreaChartProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  yKeySecondary?: string;
  areaName?: string;
  areaNameSecondary?: string;
  height?: number;
}

export function AreaChart({
  title,
  description,
  data,
  xKey,
  yKey,
  yKeySecondary,
  areaName = "Value",
  areaNameSecondary = "Secondary Value",
  height = 300,
}: AreaChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="border-border bg-card w-full flex flex-col" style={{ height }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-6 min-h-[180px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                {yKeySecondary && (
                  <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey={xKey} fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend verticalAlign="top" height={36} fontSize={12} />
              <Area
                type="monotone"
                dataKey={yKey}
                name={areaName}
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#areaGrad1)"
              />
              {yKeySecondary && (
                <Area
                  type="monotone"
                  dataKey={yKeySecondary}
                  name={areaNameSecondary}
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGrad2)"
                />
              )}
            </RechartsAreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-muted-foreground">Loading chart...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default AreaChart;
