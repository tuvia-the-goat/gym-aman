
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WeekdayChartProps {
  data: { name: string; value: number; average: number }[];
}

const WeekdayChart: React.FC<WeekdayChartProps> = ({ data }) => {
  const [showAverage, setShowAverage] = useState(true);
  
  return (
    <ChartCard title="כניסות לפי ימים בשבוע">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Switch
            id="weekday-display-mode"
            checked={showAverage}
            onCheckedChange={setShowAverage}
          />
          <Label htmlFor="weekday-display-mode" className="text-sm">
            {showAverage ? "הצג ממוצע" : "הצג סה״כ"}
          </Label>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickMargin={40}/>
            <Tooltip 
              formatter={(value) => [
                `${value} ${showAverage ? 'כניסות (ממוצע)' : 'כניסות (סה״כ)'}`, 
                showAverage ? 'ממוצע כניסות' : 'סה״כ כניסות'
              ]} 
            />
            <Bar 
              dataKey={showAverage ? "average" : "value"} 
              fill="#3b82f6" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default WeekdayChart;
