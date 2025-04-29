import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopSubDepartmentsChartProps {
  data: {
    name: string;
    value: number;
    rawValue: number;
    departmentName: string;
    baseName: string;
    numOfPeople: number;
  }[];
  showBaseColumn?: boolean;
}

const TopSubDepartmentsChart: React.FC<TopSubDepartmentsChartProps> = ({
  data,
  showBaseColumn = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5 תתי-המסגרות המובילות</CardTitle>
        <p className="text-sm text-muted-foreground"> * לפי אחוז כניסות</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tickMargin={100}
                tick={{ fontSize: 14 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "אחוז כניסות"]}
                labelFormatter={(label) => `תת-מסגרת: ${label}`}
              />
              <Bar
                dataKey="value"
                fill="#8884d8"
                name="אחוז כניסות"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תת-מסגרת</TableHead>
                <TableHead className="text-right">מסגרת</TableHead>
                {showBaseColumn && (
                  <TableHead className="text-right">בסיס</TableHead>
                )}
                <TableHead className="text-right">אחוז כניסות</TableHead>
                <TableHead className="text-right">מספר כניסות</TableHead>
                <TableHead className="text-right">תקנים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="text-right">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {item.departmentName}
                  </TableCell>
                  {showBaseColumn && (
                    <TableCell className="text-right">
                      {item.baseName}
                    </TableCell>
                  )}
                  <TableCell className="text-right">{item.value}%</TableCell>
                  <TableCell className="text-right">{item.rawValue}</TableCell>
                  <TableCell className="text-right">
                    {item.numOfPeople}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSubDepartmentsChart;
