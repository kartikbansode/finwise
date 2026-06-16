'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function IncomeChart({
  data
}: {
  data: any[];
}) {
  return (
    <div className="bg-white rounded-xl p-6 border">
      <h2 className="font-semibold mb-4">
        Income Trend
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            dataKey="income"
            stroke="#10b981"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}