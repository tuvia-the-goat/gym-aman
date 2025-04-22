// src/components/EntriesHistory/ExportButton.tsx

import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
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

  const getStatusDisplay = (status: string | undefined) => {
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
      
      // Get current date for the report
      const now = new Date();
      const formattedDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
      const randomId = Math.random().toString(36).substring(2, 8);
      const filename = `כניסות-חדר-כושר_${formattedDate}_${randomId}.xls`;
      
      // Prepare filters information for Excel export
      const activeFilters = [];
      
      if (searchTerm) {
        activeFilters.push(`חיפוש: "${searchTerm}"`);
      }
      
      if (selectedDepartment) {
        const departmentName = getDepartmentName(selectedDepartment);
        activeFilters.push(`מסגרת: ${departmentName}`);
      }
      
      if (selectedSubDepartment) {
        const subDepartmentName = getSubDepartmentName(selectedSubDepartment);
        activeFilters.push(`תת-מסגרת: ${subDepartmentName}`);
      }
      
      if (selectedBase) {
        const baseName = getBaseName(selectedBase);
        activeFilters.push(`בסיס: ${baseName}`);
      }
      
      if (selectedProfile) {
        activeFilters.push(`פרופיל רפואי: ${selectedProfile}`);
      }
      
      if (startDate && endDate) {
        activeFilters.push(`טווח תאריכים: ${formatDate(startDate.toISOString())} עד ${formatDate(endDate.toISOString())}`);
      } else if (startDate) {
        activeFilters.push(`מתאריך: ${formatDate(startDate.toISOString())}`);
      } else if (endDate) {
        activeFilters.push(`עד תאריך: ${formatDate(endDate.toISOString())}`);
      }
      
      // Create styled HTML table for Excel
      let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>דוח כניסות</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayRightToLeft/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            direction: rtl;
            font-family: 'Assistant', 'Calibri', 'Arial', sans-serif;
          }
          .header {
            background-color:rgb(89, 129, 81); /* Slate-500 - more gentle color */
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 8px;
            border: 1px solidrgb(69, 123, 95); /* Slate-600 */
          }
          .title-row {
            background-color:rgb(51, 101, 66); /* Blue-500 - more gentle primary color */
            color: white;
            font-size: 16pt;
            font-weight: bold;
            height: 50px;
            text-align: center;
          }
          .logo-cell {
            text-align: center;
            vertical-align: middle;
            width: 50px;
          }
          td {
            padding: 8px;
            border: 1px solidrgb(188, 190, 193); /* Slate-200 */
            text-align: center; /* Center all data */
            font-family: 'Assistant', 'Calibri', 'Arial', sans-serif;
          }
          th {
            padding: 8px;
            text-align: center;
          }
          .row-even {
            background-color:rgb(227, 227, 227); /* Slate-50 - very light */
          }
          .row-odd {
            background-color: #f1f5f9; /* Slate-100 - light */
          }
          .status-cell {
            font-weight: bold;
            text-align: center;
          }
          .footer {
            background-color:rgb(101, 145, 103); /* Blue-100 - light blue */
            font-style: italic;
            text-align: center;
            padding: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <table>
          <tr class="title-row">
            <td colspan="${admin?.role === "generalAdmin" ? 8 : 7}">דוח כניסות - מערכת אימ"ון - ${formattedDate} &#128170;</td>
          </tr>
          <tr>
            <th class="header">שם מתאמן</th>
            <th class="header">מספר אישי</th>
            <th class="header">מסגרת</th>
            <th class="header">תת-מסגרת</th>
            ${admin?.role === "generalAdmin" ? '<th class="header">בסיס</th>' : ''}
            <th class="header">תאריך</th>
            <th class="header">שעה</th>
            <th class="header">סטטוס</th>
          </tr>`;

      // Add rows with data and alternating row colors
      allEntries.forEach((entry, index) => {
        const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
        const statusClass = getStatusColorClass(entry.status);
        
        // Force all data to be strings with explicit formatting
        tableHtml += `
          <tr class="${rowClass}">
            <td style="mso-number-format:'\\@'">${entry.traineeFullName || '-'}</td>
            <td style="mso-number-format:'\\@'">${entry.traineePersonalId}</td>
            <td style="mso-number-format:'\\@'">${getDepartmentName(entry.departmentId)}</td>
            <td style="mso-number-format:'\\@'">${getSubDepartmentName(entry.subDepartmentId || '')}</td>
            ${admin?.role === "generalAdmin" ? `<td style="mso-number-format:'\\@'">${getBaseName(entry.baseId)}</td>` : ''}
            <td style="mso-number-format:'\\@'">${formatDate(entry.entryDate)}</td>
            <td style="mso-number-format:'\\@'">${entry.entryTime}</td>
            <td class="status-cell" style="${statusClass}; mso-number-format:'\\@'">${getStatusDisplay(entry.status)}</td>
          </tr>
        `;
      });
      
      // Add summary footer with filter information
      tableHtml += `
          <tr>
            <td colspan="${admin?.role === "generalAdmin" ? 8 : 7}" class="footer">סה"כ רשומות: ${allEntries.length}</td>
          </tr>
        </table>`;
        
      // Add filter section if there are active filters
      if (activeFilters.length > 0) {
        tableHtml += `
        <div style="margin-top: 20px; direction: rtl; font-family: 'Assistant', 'Calibri', 'Arial', sans-serif;">
          <table style="width: 60%; margin: 0 auto; border-collapse: collapse;">
            <tr>
              <th colspan="2" style="background-color: #e0e7ff; padding: 8px; text-align: center; border: 1px solid #c7d2fe; font-weight: bold;">
                סינון נתונים
              </th>
            </tr>
            ${activeFilters.map((filter, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f5f7ff' : '#ffffff'};">
                <td style="padding: 6px 12px; border: 1px solid #e5e7eb; text-align: right; mso-number-format:'\\@';">
                  ${filter}
                </td>
              </tr>
            `).join('')}
          </table>
        </div>`;
      }
      
      // Create a Blob with the HTML table content
      const BOM = '\uFEFF'; // Add BOM for UTF-8 encoding to handle Hebrew characters
      const blob = new Blob([BOM + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      
      // Create a temporary link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
  
  // Helper function to get status color styling for Excel - using more gentle colors
  const getStatusColorClass = (status: string | undefined): string => {
    switch (status) {
      case 'success':
        return 'color: #10b981;'; // Emerald-500 (softer green)
      case 'noMedicalApproval':
        return 'color: #f87171;'; // Red-400 (softer red)
      case 'notRegistered':
        return 'color: #60a5fa;'; // Blue-400 (softer blue)
      default:
        return 'color: #94a3b8;'; // Gray
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