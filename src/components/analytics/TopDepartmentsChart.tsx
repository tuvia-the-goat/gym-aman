import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Department {
  name: string;
  value: number;
  percentage: string;
  baseName: string;
  numOfPeople: number;
}

interface TopDepartmentsChartProps {
  data: Department[];
  showBaseColumn: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A478E8"];

// Custom tooltip to show percentage
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <p className="text-right">{`${payload[0].payload.name}: ${payload[0].payload.percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const TopDepartmentsChart: React.FC<TopDepartmentsChartProps> = ({
  data,
  showBaseColumn,
}) => {
  // Transform data for pie chart to use percentages
  const pieChartData = data.map((dept) => ({
    ...dept,
    value: parseInt(dept.percentage), // Use parseInt instead of parseFloat
  }));

  return (
    <ChartCard title="5 המסגרות המובילות">
      {data.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-right mb-2">
            * לפי אחוז כניסות מתוך כמות אנשים
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
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
                  <TableHead className="text-right">כמות תקנים</TableHead>
                  <TableHead className="text-right">אחוז מכמות אנשים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell>{dept.name}</TableCell>
                    {showBaseColumn && <TableCell>{dept.baseName}</TableCell>}
                    <TableCell>{dept.value}</TableCell>
                    <TableCell>{dept.numOfPeople}</TableCell>
                    <TableCell>{dept.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          אין נתונים זמינים
        </p>
      )}
    </ChartCard>
  );
};

export default TopDepartmentsChart;
