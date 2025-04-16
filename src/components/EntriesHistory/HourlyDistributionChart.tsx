
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
    <div className="glass p-5 rounded-xl border border-border/30 shadow-sm">
      <h3 className="font-semibold text-xl mb-2 flex items-center">
        <Clock className="h-5 w-5 ml-2 text-primary" />
        התפלגות שעות אימון
      </h3>
      
      <ChartContainer className="h-40" config={{
        hour: {
          label: "שעות ביום",
          theme: { dark: "#0ea5e9", light: "#0ea5e9" }
        }
      }}>
        <BarChart data={traineeAnalytics.hourData}>
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
            fill="var(--color-hour)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default HourlyDistributionChart;
