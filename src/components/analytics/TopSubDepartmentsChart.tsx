import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SubDepartment {
  id: string;
  name: string;
  value: number;
  departmentName: string;
  baseName: string;
}

interface TopSubDepartmentsChartProps {
  data: SubDepartment[];
  showBaseColumn: boolean;
}

const TopSubDepartmentsChart: React.FC<TopSubDepartmentsChartProps> = ({ data, showBaseColumn }) => {
  return (
    <ChartCard title="5 תתי-המסגרות המובילות">
      {data.length > 0 ? (
        <div className="space-y-4">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number"/>
                <YAxis dataKey="name" type="category" width={150} tickMargin={100}/>
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" /> {/* Using indigo color to differentiate from other charts */}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תת-מסגרת</TableHead>
                  <TableHead className="text-right">מסגרת</TableHead>
                  {showBaseColumn && (
                    <TableHead className="text-right">בסיס</TableHead>
                  )}
                  <TableHead className="text-right">כניסות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((subDept, index) => (
                  <TableRow key={index}>
                    <TableCell>{subDept.name}</TableCell>
                    <TableCell>{subDept.departmentName}</TableCell>
                    {showBaseColumn && (
                      <TableCell>{subDept.baseName}</TableCell>
                    )}
                    <TableCell>{subDept.value}</TableCell>
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

export default TopSubDepartmentsChart;