
import React, { useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell 
} from 'recharts';
import ChartCard from './ChartCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface AgeDataPoint {
  age: number;
  count: number;
  name?: string;
  traineeIds?: string[];
}

interface FullTraineeDataPoint {
  _id: string;
  age: number;
  fullName: string;
  gender: 'male' | 'female';
  medicalProfile: string;
  departmentName: string;
}

interface AgeDistributionProps {
  data: AgeDataPoint[];
  traineeDetails: FullTraineeDataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="text-right mb-1"><strong>גיל:</strong> {data.age} שנים</p>
        <p className="text-right mb-1"><strong>כמות:</strong> {data.count} מתאמנים</p>
      </div>
    );
  }
  return null;
};

const AgeDistributionChart: React.FC<AgeDistributionProps> = ({ data, traineeDetails }) => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const traineesForSelectedAge = selectedAge 
    ? traineeDetails.filter(trainee => trainee.age === selectedAge)
    : [];
  
  const genderColors = {
    male: '#3b82f6',
    female: '#ec4899'
  };

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
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const age = e.activePayload[0].payload.age;
                  setSelectedAge(age);
                  setShowDetails(true);
                }
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
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="מתאמנים" data={data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center">אין נתונים להצגה</p>
        )}
      </div>
      
      {selectedAge && showDetails && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">פרטי מתאמנים בגיל {selectedAge}</h4>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>סגור</Button>
          </div>
          {traineesForSelectedAge.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-right">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-sm">שם מלא</th>
                    <th className="p-2 text-sm">מגדר</th>
                    <th className="p-2 text-sm">פרופיל רפואי</th>
                    <th className="p-2 text-sm">מחלקה</th>
                  </tr>
                </thead>
                <tbody>
                  {traineesForSelectedAge.map(trainee => (
                    <tr key={trainee._id} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm">{trainee.fullName}</td>
                      <td className="p-2 text-sm">{trainee.gender === 'male' ? 'זכר' : 'נקבה'}</td>
                      <td className="p-2 text-sm">{trainee.medicalProfile}</td>
                      <td className="p-2 text-sm">{trainee.departmentName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">אין נתונים מפורטים להצגה</p>
          )}
        </div>
      )}
    </ChartCard>
  );
};

export default AgeDistributionChart;
