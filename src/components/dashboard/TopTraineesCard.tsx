
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from '@/context/AdminContext';

interface TopTrainee {
  id: string;
  name: string;
  count: number;
  departmentName: string;
  subDepartmentName: string;
  baseName ?: string;
}

interface TopTraineesCardProps {
  trainees: TopTrainee[];
  title: string;
  emptyMessage?: string;
}

const TopTraineesCard: React.FC<TopTraineesCardProps> = ({ 
  trainees, 
  title, 
  emptyMessage = "אין נתונים זמינים" 
}) => {
  const { admin } = useAdmin();
  const isGeneralAdmin = admin?.role !== 'gymAdmin' && !admin.baseId
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {trainees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">#</TableHead>
                <TableHead className="text-right">שם</TableHead>
                {isGeneralAdmin && <TableHead className="text-right">בסיס</TableHead>}
                <TableHead className="text-right">מסגרת</TableHead>
                <TableHead className="text-right">תת-מסגרת</TableHead>
                <TableHead className="text-right">כניסות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainees.map((trainee, index) => (
                <TableRow key={trainee.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {index < 3 ? (
                        <Medal className={`h-5 w-5 ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                          "text-amber-700"
                        }`} />
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{trainee.name}</TableCell>
                  {isGeneralAdmin && <TableCell>{trainee.baseName}</TableCell>}
                  <TableCell>{trainee.departmentName}</TableCell>
                  <TableCell>{trainee.subDepartmentName}</TableCell>
                  <TableCell>{trainee.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-6 text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopTraineesCard;
