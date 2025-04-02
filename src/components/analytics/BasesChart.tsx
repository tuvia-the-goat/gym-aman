
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

interface BasesChartProps {
  data: { name: string; value: number }[];
}

const BasesChart: React.FC<BasesChartProps> = ({ data }) => {
  return (
    <ChartCard title="כניסות לפי בסיסים">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default BasesChart;