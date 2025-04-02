
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HourlyDistributionChartProps {
  entries: Array<{
    entryDate: string;
    entryTime: string;
  }>;
}

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({ entries }) => {
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);
  
  // Generate data for each hour of the day
  const generateHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      count: 0
    }));

    // Filter entries by selected day if any
    let filteredEntries = [...entries];
    
    if (selectedDay !== undefined) {
      filteredEntries = entries.filter(entry => {
        const date = new Date(entry.entryDate);
        const dayIndex = date.getDay();
        const dayName = getDayName(dayIndex);
        return dayName === selectedDay;
      });
    }
    
    // Count entries for each hour
    filteredEntries.forEach(entry => {
      const hour = parseInt(entry.entryTime.split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hours[hour].count++;
      }
    });
    
    return hours;
  };
  
  const getDayName = (index: number): string => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[index];
  };
  
  const getWeekdayDistribution = () => {
    const days = [
      { name: 'ראשון', count: 0 },
      { name: 'שני', count: 0 },
      { name: 'שלישי', count: 0 },
      { name: 'רביעי', count: 0 },
      { name: 'חמישי', count: 0 },
      { name: 'שישי', count: 0 },
      { name: 'שבת', count: 0 }
    ];
    
    entries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayIndex = date.getDay();
      days[dayIndex].count++;
    });
    
    return days;
  };
  
  const hourlyData = generateHourlyData();
  const weekdayDistribution = getWeekdayDistribution();
  
  return (
    <ChartCard title="פילוח שעות כניסה">
      <div className="mb-4">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="בחר יום בשבוע (כל הימים)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>כל הימים</SelectItem>
            {weekdayDistribution.map((day) => (
              <SelectItem key={day.name} value={day.name}>
                {day.name} ({day.count} כניסות)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              tickFormatter={(value) => value.split(':')[0]}
              interval={2}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} כניסות`, 'מספר כניסות']}
              labelFormatter={(label) => `שעה ${label}`}
            />
            <Bar dataKey="count" fill="#64748b" name="מספר כניסות" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default HourlyDistributionChart;
