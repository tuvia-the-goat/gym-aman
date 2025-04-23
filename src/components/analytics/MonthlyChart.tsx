
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MonthlyChartProps {
  data: { name: string; value: number; average: number }[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  
  return (
    <ChartCard title="כניסות לפי חודשים">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickMargin={20}/>
            <Tooltip 
              formatter={(value) => [
                `${value} כניסות`, 
                'סה״כ כניסות'
              ]} 
            />
            <Line 
              type="monotone" 
              dataKey={"value"} 
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default MonthlyChart;
