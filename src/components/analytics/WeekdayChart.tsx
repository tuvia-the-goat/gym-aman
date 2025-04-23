
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WeekdayChartProps {
  data: { name: string; value: number; average: number }[];
}

const WeekdayChart: React.FC<WeekdayChartProps> = ({ data }) => {
  
  return (
    <ChartCard title="כניסות לפי ימים בשבוע">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickMargin={40}/>
            <Tooltip 
              formatter={(value) => [
                `${value} כניסות`, 
                'סה״כ כניסות'
              ]} 
            />
            <Bar 
              dataKey={"value"} 
              fill="#3b82f6" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default WeekdayChart;
