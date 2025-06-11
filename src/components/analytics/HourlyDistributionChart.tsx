import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from './ChartCard';

interface HourlyData {
  hour: number;
  name: string;
  count: number;
  average: number;
}

interface HourlyDistributionChartProps {
  data: HourlyData[];
  isLoading: boolean;
  onDayChange: (day: string) => void;
}

const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({ data, isLoading, onDayChange }) => {
  const [selectedDay, setSelectedDay] = useState('כל הימים');

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    onDayChange(day);
  };

  return (
    <ChartCard 
      title="התפלגות כניסות לפי שעות" 
      className="col-span-1 lg:col-span-2"
    >
      <div className="flex flex-row-reverse justify-between items-center ml-16 mb-4">
        <div className="flex items-center gap-3">
          <Select value={selectedDay} onValueChange={handleDayChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר יום" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="כל הימים">כל הימים</SelectItem>
              {dayNames.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          בחר יום להצגת נתוני כניסות:
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} כניסות`, 'כניסות']}
              />
              <Bar dataKey="count" fill="#8b5cf6" name="כניסות" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">אין נתונים זמינים</p>
      )}
    </ChartCard>
  );
};

export default HourlyDistributionChart;
