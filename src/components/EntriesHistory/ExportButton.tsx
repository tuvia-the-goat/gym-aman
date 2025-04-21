// src/components/EntriesHistory/ExportButton.tsx

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { Entry } from '@/types';
import { useAdmin } from '@/context/AdminContext';

interface ExportButtonProps {
  entries: Entry[];
  isLoading: boolean;
}

const ExportButton = ({ entries, isLoading }: ExportButtonProps) => {
  const { admin, departments, bases, subDepartments } = useAdmin();
  const { toast } = useToast();

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      return "תאריך לא תקין";
    }
  };

  const getEntryStatusDisplay = (status: string | undefined) => {
    switch (status) {
      case "success":
        return "נכנס/ה בהצלחה";
      case "noMedicalApproval":
        return "אין אישור רפואי בתוקף";
      case "notRegistered":
        return "משתמש לא רשום";
      default:
        return "";
    }
  };

  const exportToExcel = () => {
    if (entries.length === 0) return;

    // Create a meaningful filename with current date
    const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const filename = `כניסות_חדר_כושר_${formattedDate}.xlsx`;

    // Create the export data
    const exportData = entries.map((entry) => ({
      'שם מתאמן': entry.traineeFullName || "-",
      'מספר אישי': entry.traineePersonalId,
      'מסגרת': getDepartmentName(entry.departmentId),
      'תת-מסגרת': getSubDepartmentName(entry.subDepartmentId || ""),
      ...(admin?.role === "generalAdmin" ? { 'בסיס': getBaseName(entry.baseId) } : {}),
      'תאריך': formatDate(entry.entryDate),
      'שעה': entry.entryTime,
      'סטטוס': getEntryStatusDisplay(entry.status),
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    
    // Create worksheet from the data
    const ws = XLSX.utils.json_to_sheet(exportData, { header: Object.keys(exportData[0]) });

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // שם מתאמן
      { wch: 15 }, // מספר אישי
      { wch: 20 }, // מסגרת
      { wch: 20 }, // תת-מסגרת
      ...(admin?.role === "generalAdmin" ? [{ wch: 15 }] : []), // בסיס
      { wch: 12 }, // תאריך
      { wch: 10 }, // שעה
      { wch: 20 }, // סטטוס
    ];
    ws['!cols'] = columnWidths;

    // Set cell formats - all as strings except date and time
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      // Find the indexes for date and time columns based on the admin role
      const dateColumnIndex = admin?.role === "generalAdmin" ? 5 : 4;
      const timeColumnIndex = admin?.role === "generalAdmin" ? 6 : 5;
      
      // Update the cell formats for each row (skip header)
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Set date column format
        const dateCell = XLSX.utils.encode_cell({ r: R, c: dateColumnIndex });
        if (ws[dateCell]) {
          ws[dateCell].z = 'dd/mm/yyyy';
        }
        
        // Set time column format
        const timeCell = XLSX.utils.encode_cell({ r: R, c: timeColumnIndex });
        if (ws[timeCell]) {
          ws[timeCell].z = 'hh:mm';
        }
        
        // Set all columns as string type (except date)
        for (let C = range.s.c; C <= range.e.c; ++C) {
          if (C !== dateColumnIndex) { // Keep date as is, set everything else as string
            const cell = XLSX.utils.encode_cell({ r: R, c: C });
            if (ws[cell]) {
              ws[cell].t = 's';
            }
          }
        }
      }
    }
    
    // Set sheet properties for styling
    if (!ws['!props']) ws['!props'] = {};
    ws['!props'].defaultRowHeight = 20; // Set row height for better readability
    
    // // Add header styling (center alignment and gray background)
    // if (range && range.s.r >= 0) {
    //   for (let C = range.s.c; C <= range.e.c; ++C) {
    //     const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
    //     if (ws[headerCell]) {
    //       if (!ws[headerCell].s) ws[headerCell].s = {};
    //       ws[headerCell].s.alignment = { horizontal: 'center', vertical: 'center' };
    //       ws[headerCell].s.fill = { fgColor: { rgb: 'E0E0E0' } }; // Light gray background
    //       ws[headerCell].s.font = { name: 'Assistant', bold: true };
    //     }
    //   }
    // }
    
    // // Set default cell properties for the entire sheet (center alignment)
    // for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    //   for (let C = range.s.c; C <= range.e.c; ++C) {
    //     const cell = XLSX.utils.encode_cell({ r: R, c: C });
    //     if (ws[cell]) {
    //       if (!ws[cell].s) ws[cell].s = {};
    //       ws[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
    //       ws[cell].s.font = { name: 'Assistant' };
    //       ws[cell].s.fill = { fgColor: { rgb: 'F5F5F5' } }; // Very light gray background
    //     }
    //   }
    // }

    // Add the worksheet to the workbook with RTL direction
    ws['!dir'] = 'rtl'; // Set right-to-left direction
    XLSX.utils.book_append_sheet(wb, ws, 'היסטוריית כניסות');

    // Generate the Excel file
    try {
      XLSX.writeFile(wb, filename);
      
      // Show success notification
      toast({
        title: "ייצוא הושלם בהצלחה",
        description: `${entries.length} רשומות יוצאו לקובץ Excel`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      
      // Show error notification
      toast({
        title: "שגיאה בייצוא הנתונים",
        description: "אירעה שגיאה בעת ייצוא הנתונים לאקסל",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={exportToExcel}
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 ${entries.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
      disabled={isLoading || entries.length === 0}
      title={entries.length === 0 ? "אין נתונים לייצוא" : "ייצוא לקובץ אקסל"}
    >
      <Download className="h-4 w-4" />
      ייצוא לאקסל
    </Button>
  );
};

export default ExportButton;