
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
    <div className="glass p-5 rounded-xl border border-border/30 shadow-sm">
      <h3 className="font-semibold text-xl mb-2 flex items-center">
        <Calendar className="h-5 w-5 ml-2 text-primary" />
        התפלגות ימי אימון
      </h3>
      
      <ChartContainer className="w-140" config={{
        day: {
          label: "ימים בשבוע",
          theme: { dark: "#4f46e5", light: "#4f46e5" }
        }
      }}>
        <BarChart data={traineeAnalytics.dayData}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickMargin={5}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={5}
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
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default WeekdayDistributionChart;
