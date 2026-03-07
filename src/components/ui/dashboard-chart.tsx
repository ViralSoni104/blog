"use client";

import * as RechartsPkg from "recharts";

const {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} = RechartsPkg;

export interface ChartDataPoint {
  date: string;
  count: number;
}

export default function DashboardChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#88888815"
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "none",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorCount)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
