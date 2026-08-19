"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface BarChartProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  yKeySecondary?: string;
  barName?: string;
  barNameSecondary?: string;
  height?: number;
}

export function BarChart({
  title,
  description,
  data,
  xKey,
  yKey,
  yKeySecondary,
  barName = "Value",
  barNameSecondary = "Secondary Value",
  height = 300,
}: BarChartProps) {
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
            <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey={xKey} fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  color: "var(--popover-foreground)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend verticalAlign="top" height={36} fontSize={12} />
              <Bar dataKey={yKey} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name={barName} />
              {yKeySecondary && (
                <Bar dataKey={yKeySecondary} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name={barNameSecondary} />
              )}
            </RechartsBarChart>
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
export default BarChart;
