
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartCard from './ChartCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MedicalProfileData {
  name: string;
  value: number;
  color: string;
}

interface MedicalProfileChartProps {
  data: MedicalProfileData[];
}

const MedicalProfileChart: React.FC<MedicalProfileChartProps> = ({ data }) => {
  return (
    <ChartCard title="התפלגות פרופילים רפואיים">
      {data.length > 0 ? (
        <div className="space-y-4">
          <div className="h-60">
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
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} מתאמנים`, `פרופיל  ${name}`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">פרופיל רפואי</TableHead>
                  <TableHead className="text-right">מספר מתאמנים</TableHead>
                  <TableHead className="text-right">אחוז</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((profile, index) => {
                  const percentage = ((profile.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: profile.color }}
                          />
                          {profile.name}
                        </div>
                      </TableCell>
                      <TableCell>{profile.value}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">אין נתונים זמינים</p>
      )}
    </ChartCard>
  );
};

export default MedicalProfileChart;
