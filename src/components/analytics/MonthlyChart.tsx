
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MonthlyChartProps {
  data: { name: string; value: number; average: number }[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  const [showAverage, setShowAverage] = useState(true);
  
  return (
    <ChartCard title="כניסות לפי חודשים">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Switch
            id="monthly-display-mode"
            checked={showAverage}
            onCheckedChange={setShowAverage}
          />
          <Label htmlFor="monthly-display-mode" className="text-sm">
            {showAverage ? "הצג ממוצע שנתי" : "הצג סה״כ"}
          </Label>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickMargin={20}/>
            <Tooltip 
              formatter={(value) => [
                `${value} ${showAverage ? 'כניסות (ממוצע שנתי)' : 'כניסות (סה״כ)'}`, 
                showAverage ? 'ממוצע כניסות שנתי' : 'סה״כ כניסות'
              ]} 
            />
            <Line 
              type="monotone" 
              dataKey={showAverage ? "average" : "value"} 
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
