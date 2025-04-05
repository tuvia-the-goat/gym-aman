
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ChartCard from './ChartCard';

interface GenderChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const GenderDistributionChart: React.FC<GenderChartProps> = ({ data }) => {
  return (
    <ChartCard title="התפלגות מגדרית">
      <div className="h-[250px] flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} מתאמנים`, 'כמות']} />
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
