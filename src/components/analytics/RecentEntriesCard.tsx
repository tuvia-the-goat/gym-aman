
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Entry } from '@/types';

interface RecentEntriesCardProps {
  entries: Entry[];
  title: string;
  icon?: React.ReactNode;
  emptyMessage?: string;
  maxHeight?: string;
}

const RecentEntriesCard: React.FC<RecentEntriesCardProps> = ({ 
  entries, 
  title, 
  icon = <Clock className="h-5 w-5 text-blue-500" />,
  emptyMessage = "אין נתונים זמינים",
  maxHeight = "250px"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-medium">
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className={`space-y-4 overflow-y-auto`} style={{ maxHeight }}>
            {entries.map(entry => (
              <div key={entry._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{entry.traineeFullName}</p>
                  <p className="text-xs text-muted-foreground">{entry.entryTime}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  entry.status === 'success' ? 'bg-green-100 text-green-800' :
                  entry.status === 'noMedicalApproval' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {entry.status === 'success' ? 'מאושר' :
                   entry.status === 'noMedicalApproval' ? 'אין אישור רפואי' :
                   'לא רשום'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentEntriesCard;
