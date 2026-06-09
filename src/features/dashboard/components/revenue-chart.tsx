"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { MOCK_DASHBOARD_STATS } from "@/mock/analytics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="h-[350px] flex flex-col border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Monthly Platform Revenue</CardTitle>
        <CardDescription>SaaS billing and safety certification fees generated</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[220px] pb-6">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DASHBOARD_STATS.revenueTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="label" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                formatter={(value) => [`$${value}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
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
export default RevenueChart;
