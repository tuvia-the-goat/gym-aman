// src/components/EntriesHistory/ExportButton.tsx

import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { Entry } from '@/types';
import { useAdmin } from '@/context/AdminContext';
import { entryService } from '@/services/api';

interface ExportButtonProps {
  searchTerm: string;
  selectedDepartment: string;
  selectedSubDepartment: string;
  selectedBase: string;
  selectedProfile: string;
  startDate?: Date;
  endDate?: Date;
  isLoading: boolean;
}

const ExportButton = ({ 
  searchTerm,
  selectedDepartment,
  selectedSubDepartment,
  selectedBase,
  selectedProfile,
  startDate,
  endDate,
  isLoading
}: ExportButtonProps) => {
  const { admin, departments, bases, subDepartments, trainees } = useAdmin();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

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

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Show loading notification
      toast({
        title: "מייצא נתונים",
        description: "אנא המתן בזמן שמייצאים את כל הנתונים...",
      });
      
      // Format dates for API request
      const formattedStartDate = startDate
        ? startDate.toISOString().split('T')[0]
        : undefined;
      const formattedEndDate = endDate
        ? endDate.toISOString().split('T')[0]
        : undefined;
      
      // Only apply the baseId filter for gym admins if no specific base is selected
      const baseIdParam =
        selectedBase || (admin?.role === "gymAdmin" ? admin.baseId : undefined);
      
      // Filter trainees by medical profile if needed
      let traineeIds;
      if (selectedProfile) {
        traineeIds = trainees
          .filter((trainee) => trainee.medicalProfile === selectedProfile)
          .map((trainee) => trainee._id)
          .join(",");
      }
      
      // Fetch all entries with current filters but without pagination
      const response = await entryService.getAllFiltered({
        search: searchTerm,
        departmentId: selectedDepartment,
        subDepartmentId: selectedSubDepartment,
        baseId: baseIdParam,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        traineeId: traineeIds,
      });
      
      const allEntries = response.entries;
      
      if (allEntries.length === 0) {
        toast({
          title: "אין נתונים לייצוא",
          description: "לא נמצאו רשומות התואמות לסינון",
          variant: "destructive",
        });
        return;
      }
      
      
      // Create a meaningful filename with current date
      const today = new Date();
      const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const filename = `כניסות_חדר_כושר_${formattedDate}.xlsx`;

      // Create the export data
      const exportData = allEntries.map((entry) => ({
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

      // Set cell formats - all as strings except date
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // Find the indexes for date and time columns based on the admin role
        const dateColumnIndex = admin?.role === "generalAdmin" ? 5 : 4;
        const timeColumnIndex = admin?.role === "generalAdmin" ? 6 : 5;
        
        // Add RTL Direction
        ws['!dir'] = 'rtl';
        
        // Set all cells as strings except date
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = XLSX.utils.encode_cell({ r: R, c: C });
            if (ws[cell]) {
              // Set all columns as strings except for date
              if (C !== dateColumnIndex) {
                ws[cell].t = 's';
              }
              
              // Special format for date and time
              if (C === dateColumnIndex) {
                ws[cell].z = 'dd/mm/yyyy';
              } else if (C === timeColumnIndex) {
                ws[cell].z = 'hh:mm';
              }
            }
          }
        }
      }
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'היסטוריית כניסות');
      
      // Apply workbook-level RTL settings
      try {
        // This will only work in full Excel files, not CSV
        if (!wb.Workbook) wb.Workbook = {};
        if (!wb.Workbook.Views) wb.Workbook.Views = [];
        wb.Workbook.Views[0] = { RTL: true };
      } catch (error) {
        console.error("Could not set RTL at workbook level:", error);
      }

      // Generate the Excel file
      XLSX.writeFile(wb, filename);
      
      // Show success notification
      toast({
        title: "ייצוא הושלם בהצלחה",
        description: `${allEntries.length} רשומות יוצאו לקובץ Excel`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      
      // Show error notification
      toast({
        title: "שגיאה בייצוא הנתונים",
        description: "אירעה שגיאה בעת ייצוא הנתונים לאקסל",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToExcel}
      variant="outline"
      size="sm"
      className="flex items-center gap-1 hover:bg-primary/10"
      disabled={isLoading || isExporting}
      title={isExporting ? "מייצא נתונים..." : "ייצוא לקובץ אקסל"}
    >
      {isExporting ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? "מייצא..." : "ייצוא לאקסל"}
    </Button>
  );
};

export default ExportButton;