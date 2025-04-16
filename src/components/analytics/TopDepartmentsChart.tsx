
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Department {
  name: string;
  value: number;
  baseName: string;
}

interface TopDepartmentsChartProps {
  data: Department[];
  showBaseColumn: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A478E8'];

const TopDepartmentsChart: React.FC<TopDepartmentsChartProps> = ({ data, showBaseColumn }) => {
  return (
    <ChartCard title="5 המסגרות המובילות">
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מסגרת</TableHead>
                  {showBaseColumn && (
                    <TableHead className="text-right">בסיס</TableHead>
                  )}
                  <TableHead className="text-right">כניסות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell>{dept.name}</TableCell>
                    {showBaseColumn && (
                      <TableCell>{dept.baseName}</TableCell>
                    )}
                    <TableCell>{dept.value}</TableCell>
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

export default TopDepartmentsChart;
