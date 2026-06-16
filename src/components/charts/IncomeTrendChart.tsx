"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Props {
  income: number;
}

export default function IncomeTrendChart({ income }: Props) {
  const data = [
    { month: "Jan", income: income * 0.45 },
    { month: "Feb", income: income * 0.6 },
    { month: "Mar", income: income * 0.55 },
    { month: "Apr", income: income * 0.8 },
    { month: "May", income: income * 0.9 },
    { month: "Jun", income: income },
    
  ];

  const growth = (
    ((data[5].income - data[0].income) / data[0].income) *
    100
  ).toFixed(1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Revenue Trend</h3>

          <p className="text-sm text-gray-500">Last 6 months</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Growth</p>

          <p className="text-lg font-bold text-emerald-600">+{growth}%</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
  <AreaChart
    width={1000}
    height={320}
    data={data}
  >
    <XAxis dataKey="month" />

    <YAxis
      width={80}
      tickFormatter={(value) =>
        `₹${(value / 100000).toFixed(1)}L`
      }
    />

    <Tooltip
      formatter={(value: any) => [
        `₹${Number(value).toLocaleString(
          "en-IN"
        )}`,
        "Income",
      ]}
    />

    <Area
      type="monotone"
      dataKey="income"
      stroke="#10b981"
      fill="#10b981"
      fillOpacity={0.15}
    />
  </AreaChart>
</div>
    </div>
  );
}
