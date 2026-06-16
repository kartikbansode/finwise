"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function ExpensePieChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border p-6">No expense data</div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 flex justify-center items-center flex-col">
      <h3 className="font-semibold mb-4">Expense Breakdown</h3>

      <PieChart width={500} height={320}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={3}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
      <div className="mt-6 space-y-2">
  {data.map((item) => (
    <div
      key={item.name}
      className="flex justify-between text-sm border-b pb-2"
    >
      <span className="capitalize">
        {item.name}
      </span>

      <span className="font-medium">
        ₹{item.value.toLocaleString("en-IN")}
      </span>
    </div>
  ))}
</div>
    </div>
    
    
  );
  
}
