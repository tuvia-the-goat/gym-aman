// src/components/EntriesHistory/EntriesTable.tsx

import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Entry, EntryStatus } from '@/types';
import { AlertTriangle, CheckCircle, XCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntriesTableProps {
  displayedEntries: Entry[];
  hasOrthopedicCondition: (traineeId: string) => boolean;
  hasMedicalLimitation: (traineeId: string) => boolean;
  handleTraineeClick: (traineeId: string) => void;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
  displayedEntries,
  hasOrthopedicCondition,
  hasMedicalLimitation,
  handleTraineeClick
}) => {
  const { admin, departments, bases, subDepartments } = useAdmin();

  const getDepartmentName = (id: string) => {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  };

  const getSubDepartmentName = (id: string) => {
    if (!id) return '-';
    const subDepartment = subDepartments.find(subDept => subDept._id === id);
    return subDepartment ? subDepartment.name : '-';
  };

  const getBaseName = (id: string) => {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  };

  const getDateFormat = (dateToFormat: Date) => {
    const day = dateToFormat.getDate();
    const month = dateToFormat.getMonth() + 1;
    const year = dateToFormat.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getEntryStatusDisplay = (status: EntryStatus) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500 ml-2" />,
          textClass: 'text-green-600',
          rowClass: ''
        };
      case 'noMedicalApproval':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500 ml-2" />,
          textClass: 'text-red-600',
          rowClass: 'bg-red-50'
        };
      case 'notRegistered':
        return {
          icon: <User className="h-4 w-4 text-blue-500 ml-2" />,
          textClass: 'text-blue-600',
          rowClass: 'bg-blue-50'
        };
      default:
        return {
          icon: null,
          textClass: '',
          rowClass: ''
        };
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right">שם מתאמן</th>
              <th className="px-4 py-3 text-right">מספר אישי</th>
              <th className="px-4 py-3 text-right">מסגרת</th>
              <th className="px-4 py-3 text-right">תת-מסגרת</th> {/* Add this line */}
              {admin?.role === 'generalAdmin' && <th className="px-4 py-3 text-right">בסיס</th>}
              <th className="px-4 py-3 text-right">תאריך</th>
              <th className="px-4 py-3 text-right">שעה</th>
              <th className="px-4 py-3 text-right">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {displayedEntries.length > 0 ? (
              displayedEntries.map(entry => {
                const hasOrthopedic = hasOrthopedicCondition(entry.traineeId);
                const hasMedical = hasMedicalLimitation(entry.traineeId);
                const statusDisplay = getEntryStatusDisplay(entry.status || 'success');
                
                return (
                  <tr 
                    key={entry._id} 
                    className={cn(
                      "border-t hover:bg-muted/50 cursor-pointer transition-colors", 
                      (hasOrthopedic || hasMedical) && "bg-amber-50", 
                      statusDisplay.rowClass
                    )} 
                    onClick={() => entry.traineeId && handleTraineeClick(entry.traineeId)}
                  >
                    <td className="px-4 py-3 flex items-center">
                      {((hasOrthopedic || hasMedical) && entry.status === 'success') && 
                        <AlertTriangle className="h-4 w-4 text-amber-500 ml-2" aria-label="סעיף אורטופדי" />
                      }
                      {entry.traineeFullName || '-'}
                    </td>
                    <td className="px-4 py-3">{entry.traineePersonalId}</td>
                    <td className="px-4 py-3">{entry.departmentId ? getDepartmentName(entry.departmentId) : '-'}</td>
                    <td className="px-4 py-3">{entry.subDepartmentId ? getSubDepartmentName(entry.subDepartmentId) : '-'}</td> {/* Add this line */}
                    {admin?.role === 'generalAdmin' && <td className="px-4 py-3">{getBaseName(entry.baseId)}</td>}
                    <td className="px-4 py-3">{getDateFormat(new Date(entry.entryDate))}</td>
                    <td className="px-4 py-3">{entry.entryTime}</td>
                    <td className={`px-4 py-3 flex items-center ${statusDisplay.textClass}`}>
                      {statusDisplay.icon}
                      {entry.status === 'success' && 'נכנס/ה בהצלחה'}
                      {entry.status === 'noMedicalApproval' && 'אין אישור רפואי בתוקף'}
                      {entry.status === 'notRegistered' && 'משתמש לא רשום'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={admin?.role === 'generalAdmin' ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">
                  לא נמצאו רשומות
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntriesTable;