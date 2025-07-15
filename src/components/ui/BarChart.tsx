import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import React from 'react';

type BarChartData = {
  name: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: BarChartData[];
  barColor?: string;
  width?: number;
  height?: number;
};

export function BarChart({ data, barColor = '#6366f1', width = 320, height = 180 }: BarChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <ReBarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={80} />
        <Tooltip />
        <Bar dataKey="value" fill={barColor} radius={[4, 4, 4, 4]}>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color || barColor} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
} 