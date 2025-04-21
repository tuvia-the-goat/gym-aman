// src/components/EntriesHistory/EntriesTable.tsx

import React from "react";
import { useAdmin } from "../../context/AdminContext";
import { Entry, EntryStatus } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EntriesTableProps {
  displayedEntries: Entry[];
  hasOrthopedicCondition: (traineeId: string) => boolean;
  hasMedicalLimitation: (traineeId: string) => boolean;
  handleTraineeClick: (traineeId: string) => void;
  isLoading: boolean;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
  displayedEntries,
  hasOrthopedicCondition,
  hasMedicalLimitation,
  handleTraineeClick,
  isLoading,
}) => {
  const { admin, departments, bases, subDepartments } = useAdmin();

  const getDepartmentName = (id: string) => {
    const department = departments.find((dept) => dept._id === id);
    return department ? department.name : "-";
  };

  const getSubDepartmentName = (id: string) => {
    if (!id) return "-";
    const subDepartment = subDepartments.find((subDept) => subDept._id === id);
    return subDepartment ? subDepartment.name : "-";
  };

  const getBaseName = (id: string) => {
    const base = bases.find((base) => base._id === id);
    return base ? base.name : "-";
  };

  const getDateFormat = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "תאריך לא תקין";
    }
  };

  const getEntryStatusDisplay = (status: EntryStatus) => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500 ml-2" />,
          textClass: "text-green-600",
          rowClass: "",
        };
      case "noMedicalApproval":
        return {
          icon: <XCircle className="h-4 w-4 text-red-500 ml-2" />,
          textClass: "text-red-600",
          rowClass: "bg-red-50",
        };
      case "notRegistered":
        return {
          icon: <User className="h-4 w-4 text-blue-500 ml-2" />,
          textClass: "text-blue-600",
          rowClass: "bg-blue-50",
        };
      default:
        return {
          icon: null,
          textClass: "",
          rowClass: "",
        };
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right">שם מתאמן</th>
              <th className="px-4 py-3 text-right">מספר אישי</th>
              <th className="px-4 py-3 text-right">מסגרת</th>
              <th className="px-4 py-3 text-right">תת-מסגרת</th>
              {admin?.role === "generalAdmin" && (
                <th className="px-4 py-3 text-right">בסיס</th>
              )}
              <th className="px-4 py-3 text-right">תאריך</th>
              <th className="px-4 py-3 text-right">שעה</th>
              <th className="px-4 py-3 text-right">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  {admin?.role === "generalAdmin" && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-20" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-32" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render empty state
  if (displayedEntries.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-muted p-3">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">לא נמצאו רשומות</h3>
        <p className="text-muted-foreground mt-2">
          נסה לשנות את פרמטרי החיפוש או הסינון
        </p>
      </div>
    );
  }

  // Render entries
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-right">שם מתאמן</th>
            <th className="px-4 py-3 text-right">מספר אישי</th>
            <th className="px-4 py-3 text-right">מסגרת</th>
            <th className="px-4 py-3 text-right">תת-מסגרת</th>
            {admin?.role === "generalAdmin" && (
              <th className="px-4 py-3 text-right">בסיס</th>
            )}
            <th className="px-4 py-3 text-right">תאריך</th>
            <th className="px-4 py-3 text-right">שעה</th>
            <th className="px-4 py-3 text-right">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {displayedEntries.map((entry) => {
            const hasOrthopedic = entry.traineeId
              ? hasOrthopedicCondition(entry.traineeId)
              : false;
            const hasMedical = entry.traineeId
              ? hasMedicalLimitation(entry.traineeId)
              : false;
            const statusDisplay = getEntryStatusDisplay(
              entry.status || "success"
            );

            return (
              <tr
                key={entry._id}
                className={cn(
                  "border-t hover:bg-muted/50 cursor-pointer transition-colors",
                  (hasOrthopedic || hasMedical) && "bg-amber-50",
                  statusDisplay.rowClass
                )}
                onClick={() =>
                  entry.traineeId && handleTraineeClick(entry.traineeId)
                }
              >
                <td className="px-4 py-3 flex items-center">
                  {(hasOrthopedic || hasMedical) &&
                    entry.status === "success" && (
                      <AlertTriangle
                        className="h-4 w-4 text-amber-500 ml-2"
                        aria-label="סעיף אורטופדי"
                      />
                    )}
                  {entry.traineeFullName || "-"}
                </td>
                <td className="px-4 py-3">{entry.traineePersonalId}</td>
                <td className="px-4 py-3">
                  {entry.departmentId
                    ? getDepartmentName(entry.departmentId)
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  {entry.subDepartmentId
                    ? getSubDepartmentName(entry.subDepartmentId)
                    : "-"}
                </td>
                {admin?.role === "generalAdmin" && (
                  <td className="px-4 py-3">{getBaseName(entry.baseId)}</td>
                )}
                <td className="px-4 py-3">{getDateFormat(entry.entryDate)}</td>
                <td className="px-4 py-3">{entry.entryTime}</td>
                <td
                  className={`px-4 py-3 flex items-center ${statusDisplay.textClass}`}
                >
                  {statusDisplay.icon}
                  {entry.status === "success" && "נכנס/ה בהצלחה"}
                  {entry.status === "noMedicalApproval" &&
                    "אין אישור רפואי בתוקף"}
                  {entry.status === "notRegistered" && "משתמש לא רשום"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EntriesTable;
