import React from 'react';
import { Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { TraineeAnalytics } from './types';

interface WeekdayDistributionChartProps {
  traineeAnalytics: TraineeAnalytics;
}

const WeekdayDistributionChart: React.FC<WeekdayDistributionChartProps> = ({ traineeAnalytics }) => {
  return (
    <div className="glass p-3 rounded-lg border border-border/30 shadow-sm">
      <h3 className="font-semibold text-base mb-2 flex items-center">
        <Calendar className="h-4 w-4 ml-1.5 text-primary" />
        התפלגות ימי אימון
      </h3>
      
      <ChartContainer className="w-full h-[200px]" config={{
        day: {
          label: "ימים בשבוע",
          theme: { dark: "#4f46e5", light: "#4f46e5" }
        }
      }}>
        <BarChart data={traineeAnalytics.dayData}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            tickMargin={3}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickMargin={3}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent />
            }
          />
          <Bar 
            dataKey="count" 
            name="מספר כניסות" 
            fill="var(--color-day)" 
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default WeekdayDistributionChart;
