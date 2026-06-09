"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Briefcase, ClipboardCheck, Award, TrendingUp, ArrowUpRight } from "lucide-react";

// Mock Data for Analytics
const COMPLIANCE_DATA = [
  { month: "Jan", permits: 42, reviews: 36, rate: 85 },
  { month: "Feb", permits: 58, reviews: 44, rate: 88 },
  { month: "Mar", permits: 69, reviews: 62, rate: 91 },
  { month: "Apr", permits: 81, reviews: 78, rate: 94 },
  { month: "May", permits: 95, reviews: 90, rate: 96 },
  { month: "Jun", permits: 112, reviews: 105, rate: 98 },
];

const WORKLOAD_DATA = [
  { name: "Structural", approved: 35, pending: 12 },
  { name: "Electrical", approved: 42, pending: 8 },
  { name: "Fire Safety", approved: 60, pending: 18 },
  { name: "Mechanical", approved: 28, pending: 14 },
  { name: "Plumbing", approved: 22, pending: 5 },
];

export function DashboardMetrics() {
  const [isMounted, setIsMounted] = useState(false);

  // Guard to ensure Recharts only runs client-side under React 19 / SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Frame animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">148</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-success font-semibold flex items-center gap-0.5">
                  +12% <ArrowUpRight className="h-3 w-3" />
                </span>{" "}
                since last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">29</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-warning font-semibold">5 Critical</span> inspection reviews
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issued Licenses</CardTitle>
              <Award className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,204</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-success font-semibold">99.2%</span> total compliance rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4 */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">SLA Compliance</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.8%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-success font-semibold">+1.4%</span> benchmark safety score
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Compliance Trend Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Compliance & Issuance Trends</CardTitle>
              <CardDescription>Monthly volume of processed permits and inspections</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[260px] pb-6">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={COMPLIANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPermits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} />
                    <YAxis fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="permits"
                      stroke="var(--color-primary)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPermits)"
                      name="Issued Permits"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-muted-foreground">Rendering graphics...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Engineering Workload Bar Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Engineering Reviews Workload</CardTitle>
              <CardDescription>Blueprint reviews divided by discipline and status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[260px] pb-6">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WORKLOAD_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} />
                    <YAxis fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend verticalAlign="top" height={36} fontSize={12} />
                    <Bar dataKey="approved" fill="var(--color-success)" name="Approved" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="var(--color-warning)" name="In Review" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-muted-foreground">Rendering graphics...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
