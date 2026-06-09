"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface PieChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
  height?: number;
}

const COLORS = [
  "#4f46e5", // primary indigo
  "#10b981", // success emerald
  "#f59e0b", // warning amber
  "#ef4444", // destructive red
  "#06b6d4", // accent cyan
];

export function PieChart({ title, description, data, height = 300 }: PieChartProps) {
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
            <RechartsPieChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" fontSize={11} />
            </RechartsPieChart>
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
export default PieChart;
