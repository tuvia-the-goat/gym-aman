
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ChartCard from './ChartCard';

interface HourlyDistributionChartProps {
  entries: any[];
}

const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'כל הימים'];

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({ entries }) => {
  const [selectedDay, setSelectedDay] = React.useState('כל הימים');
  const [showAverage, setShowAverage] = useState(true);

  // Generate hourly data based on selected day
  const hourlyData = React.useMemo(() => {
    // Initialize data for all hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      name: `${i}:00`,
      count: 0,
      average: 0,
    }));

    // Count entries for each hour and track unique dates for averages
    const hourlyDateTracker: Record<number, Set<string>> = {};
    for (let i = 0; i < 24; i++) {
      hourlyDateTracker[i] = new Set<string>();
    }

    // Filter entries based on selected day
    const filteredEntries = entries.filter(entry => {
      if (selectedDay === 'כל הימים') return true;
      
      const date = new Date(entry.entryDate);
      const dayOfWeek = date.getDay();
      const dayIndex = dayOfWeek; // 0 = Sunday, 1 = Monday, etc.
      
      return dayNames[dayIndex] === selectedDay;
    });

    // Count entries for each hour and track unique dates
    filteredEntries.forEach(entry => {
      const hourMatch = entry.entryTime.match(/^(\d{1,2}):/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1], 10);
        if (hour >= 0 && hour < 24) {
          hours[hour].count++;
          hourlyDateTracker[hour].add(entry.entryDate);
        }
      }
    });

    // Calculate averages based on unique dates
    for (let i = 0; i < 24; i++) {
      const uniqueDatesCount = hourlyDateTracker[i].size;
      hours[i].average = uniqueDatesCount > 0 
        ? parseFloat((hours[i].count / uniqueDatesCount).toFixed(1)) 
        : 0;
    }

    // Return only hours with data and between 5:00 and 22:00
    return hours
      .filter(hourData => hourData.hour >= 5 && hourData.hour <= 22)
      .sort((a, b) => a.hour - b.hour);
  }, [entries, selectedDay]);

  return (
    <ChartCard 
      title="כניסות לפי שעות" 
      className="col-span-1 lg:col-span-2"
    >
      <div className="flex flex-row-reverse justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר יום" />
            </SelectTrigger>
            <SelectContent>
              {dayNames.map(day => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Switch
              id="hourly-display-mode"
              checked={showAverage}
              onCheckedChange={setShowAverage}
            />
            <Label htmlFor="hourly-display-mode" className="text-sm">
              {showAverage ? "הצג ממוצע" : "הצג סה״כ"}
            </Label>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          בחר יום להצגת נתוני כניסות:
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={hourlyData}
          margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickMargin={10}
          />
          <Tooltip 
            formatter={(value) => [
              `${value} ${showAverage ? 'כניסות (ממוצע)' : 'כניסות (סה״כ)'}`, 
              showAverage ? 'ממוצע כניסות' : 'סה״כ כניסות'
            ]}
            labelFormatter={(label) => `שעה: ${label}`}
          />
          <Bar 
            dataKey={showAverage ? "average" : "count"} 
            fill="#4f46e5" 
            name={showAverage ? "ממוצע כניסות" : "סה״כ כניסות"}
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default HourlyDistributionChart;
