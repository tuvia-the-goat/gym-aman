
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopTrainee {
  name: string;
  value: number;
  departmentName: string;
  baseName: string;
}

interface TopTraineesChartProps {
  data: TopTrainee[];
  hasSpecificFilters: boolean;
  showBaseColumn: boolean;
}

const TopTraineesChart: React.FC<TopTraineesChartProps> = ({ data, hasSpecificFilters, showBaseColumn }) => {
  return (
    <ChartCard title={`5 המתאמנים המובילים${hasSpecificFilters ? ' (מבין אלה שנבחרו)' : ''}`}>
      {data.length > 0 ? (
        <div className="space-y-4">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number"/>
                <YAxis dataKey="name" type="category" width={150} tickMargin={100}/>
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">מחלקה</TableHead>
                  {showBaseColumn && (
                    <TableHead className="text-right">בסיס</TableHead>
                  )}
                  <TableHead className="text-right">כניסות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((trainee, index) => (
                  <TableRow key={index}>
                    <TableCell>{trainee.name}</TableCell>
                    <TableCell>{trainee.departmentName}</TableCell>
                    {showBaseColumn && (
                      <TableCell>{trainee.baseName}</TableCell>
                    )}
                    <TableCell>{trainee.value}</TableCell>
                  </TableRow>
                ))}
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

export default TopTraineesChart;
