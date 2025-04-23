
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from './ChartCard';


interface GenderChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  entriesData: {
    name: string;
    value: number;
    color: string;
  }[];
}

const GenderDistributionChart: React.FC<GenderChartProps> = ({ data, entriesData }) => {
  const [dataType, setDataType] = useState<"trainees" | "entries">("entries");
  
  const displayData = dataType === "trainees" ? data : entriesData;

  return (
    <ChartCard title="התפלגות מגדרית">
      <div className="flex justify-end mb-4 gap-2">
      <Select
  value={dataType}
  onValueChange={(value) => setDataType(value as "trainees" | "entries")}
>
  <SelectTrigger id="data-type" className="w-[180px]">
    <SelectValue placeholder="בחר סוג נתון" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="trainees">כמות מתאמנים</SelectItem>
    <SelectItem value="entries">כמות כניסות</SelectItem>
  </SelectContent>
</Select>
      </div>
      <div className="h-[250px] flex items-center justify-center">
        {displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center">אין נתונים להצגה</p>
        )}
      </div>
    </ChartCard>
  );
};

export default GenderDistributionChart;
