
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
  const [dataType, setDataType] = useState<"trainees" | "entries">("trainees");
  
  const displayData = dataType === "trainees" ? data : entriesData;

  return (
    <ChartCard title="התפלגות מגדרית">
      <div className="flex justify-end mb-4">
        <RadioGroup
          defaultValue="trainees"
          value={dataType}
          onValueChange={(value) => setDataType(value as "trainees" | "entries")}
          className="flex flex-row space-x-3 space-x-reverse rtl:space-x-reverse"
        >
          <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
            <RadioGroupItem value="trainees" id="trainees" />
            <Label htmlFor="trainees">לפי מתאמנים</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
            <RadioGroupItem value="entries" id="entries" />
            <Label htmlFor="entries">לפי כניסות</Label>
          </div>
        </RadioGroup>
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
              <Legend verticalAlign="bottom" height={36} />
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
