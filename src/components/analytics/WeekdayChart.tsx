
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

interface WeekdayChartProps {
  data: { name: string; value: number }[];
}

const WeekdayChart: React.FC<WeekdayChartProps> = ({ data }) => {
  return (
    <ChartCard title="כניסות לפי ימים בשבוע">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickMargin={40}/>
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default WeekdayChart;