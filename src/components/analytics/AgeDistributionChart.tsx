
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

interface AgeDataPoint {
  age: number;
  count: number;
  name?: string;
}

interface AgeDistributionProps {
  data: AgeDataPoint[];
}

const AgeDistributionChart: React.FC<AgeDistributionProps> = ({ data }) => {
  return (
    <ChartCard title="התפלגות גילאים">
      <div className="h-[250px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="age" 
                name="גיל" 
                unit=" שנים" 
                domain={['dataMin', 'dataMax']} 
              />
              <YAxis 
                type="number" 
                dataKey="count" 
                name="כמות" 
                unit=" מתאמנים"
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="מתאמנים" data={data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center">אין נתונים להצגה</p>
        )}
      </div>
    </ChartCard>
  );
};

export default AgeDistributionChart;
