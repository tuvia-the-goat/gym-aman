import React from 'react';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { TraineeAnalytics } from './types';

interface HourlyDistributionChartProps {
  traineeAnalytics: TraineeAnalytics;
}

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({ traineeAnalytics }) => {
  return (
    <div className="glass p-3 rounded-lg border border-border/30 shadow-sm">
      <h3 className="font-semibold text-base mb-2 flex items-center">
        <Clock className="h-4 w-4 ml-1.5 text-primary" />
        התפלגות שעות אימון
      </h3>
      
      <ChartContainer className="w-full h-[200px]" config={{
        hour: {
          label: "שעות ביום",
          theme: { dark: "#0ea5e9", light: "#0ea5e9" }
        }
      }}>
        <BarChart data={traineeAnalytics.hourData}>
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
            fill="var(--color-hour)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default HourlyDistributionChart;
