"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { MOCK_DASHBOARD_STATS } from "@/mock/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ProjectChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="h-[350px] flex flex-col border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Active Inspections by Category</CardTitle>
        <CardDescription>Distribution of compliance cases across engineering domains</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[220px] pb-6">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_DASHBOARD_STATS.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Inspection Count" />
            </BarChart>
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
export default ProjectChart;
