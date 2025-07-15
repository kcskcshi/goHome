import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import React from 'react';

export type DonutChartData = {
  name: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: DonutChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
};

export function DonutChart({ data, width = 180, height = 180, innerRadius = 60, outerRadius = 80 }: DonutChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''} ${value ?? ''}`}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
} 