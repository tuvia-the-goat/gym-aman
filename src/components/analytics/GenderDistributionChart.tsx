
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
        <Label htmlFor="hourly-display-mode" className="text-sm">
          {dataType === "trainees" ? "כמות מתאמנים" : "כמות כניסות"}
        </Label>
        <Switch
          id="hourly-display-mode"
          checked={dataType === "trainees"}
          onCheckedChange={(checked) => setDataType(checked ? "trainees" : "entries")}
          />
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
