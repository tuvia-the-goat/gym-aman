// src/components/EntriesHistory/ExportEntries.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Entry } from '@/types';
import { useAdmin } from '@/context/AdminContext';

interface ExportEntriesProps {
  filteredEntries: Entry[];
}

const ExportEntries: React.FC<ExportEntriesProps> = ({ filteredEntries }) => {
  const { departments, bases, subDepartments } = useAdmin();

  // Helper functions to get names for IDs
  const getDepartmentName = (id: string): string => {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  };

  const getSubDepartmentName = (id: string): string => {
    if (!id) return '-';
    const subDepartment = subDepartments.find(subDept => subDept._id === id);
    return subDepartment ? subDepartment.name : '-';
  };

  const getBaseName = (id: string): string => {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  };

  const getDateFormat = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusText = (status: string | undefined): string => {
    switch (status) {
      case 'success':
        return 'נכנס בהצלחה';
      case 'noMedicalApproval':
        return 'אין אישור רפואי בתוקף';
      case 'notRegistered':
        return 'משתמש לא רשום';
      default:
        return '';
    }
  };

  // Get status color for styling
  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case 'success':
        return '#16a34a'; // Green success
      case 'noMedicalApproval':
        return '#ef4444'; // Red
      case 'notRegistered':
        return '#3b82f6'; // Blue
      default:
        return '#94a3b8'; // Gray
    }
  };

  const exportToExcel = () => {
    // Get current date for the report
    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    
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
          font-family: 'Calibri', 'Arial', sans-serif;
        }
        .header {
          background-color: #15803d; /* Green header */
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 8px;
          border: 1px solid #166534;
        }
        .title-row {
          background-color: #22c55e; /* Lighter green */
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
          padding: 6px;
          border: 1px solid #d1d5db;
          text-align: right;
          font-family: 'Calibri', 'Arial', sans-serif;
        }
        .row-even {
          background-color: #f0fdf4;
        }
        .row-odd {
          background-color: #dcfce7;
        }
        .status-cell {
          font-weight: bold;
          text-align: center;
        }
        .footer {
          background-color: #dcfce7;
          font-style: italic;
          text-align: left;
          padding: 8px;
        }
      </style>
    </head>
    <body>
      <table>
        <tr class="title-row">
          <td colspan="8">דוח כניסות - מערכת אימ"ון - ${formattedDate} &#128170;</td>
        </tr>
        <tr>
          <th class="header">שם מתאמן</th>
          <th class="header">מספר אישי</th>
          <th class="header">מסגרת</th>
          <th class="header">תת-מסגרת</th>
          <th class="header">בסיס</th>
          <th class="header">תאריך</th>
          <th class="header">שעה</th>
          <th class="header">סטטוס</th>
        </tr>`;

    // Add rows with data and alternating row colors
    filteredEntries.forEach((entry, index) => {
      const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
      const statusColor = getStatusColor(entry.status);
      
      tableHtml += `
        <tr class="${rowClass}">
          <td>${entry.traineeFullName || '-'}</td>
          <td>${entry.traineePersonalId}</td>
          <td>${entry.departmentId ? getDepartmentName(entry.departmentId) : '-'}</td>
          <td>${entry.subDepartmentId ? getSubDepartmentName(entry.subDepartmentId) : '-'}</td>
          <td>${getBaseName(entry.baseId)}</td>
          <td>${getDateFormat(entry.entryDate)}</td>
          <td>${entry.entryTime}</td>
          <td class="status-cell" style="color: ${statusColor};">${getStatusText(entry.status)}</td>
        </tr>
      `;
    });
    
    // Add summary footer
    tableHtml += `
        <tr>
          <td colspan="8" class="footer">סה"כ רשומות: ${filteredEntries.length}</td>
        </tr>
      </table>
      
      <!-- Add gym icon using ASCII art since we can't embed images -->
      <div style="display:none">
      &#128170; &#127947; &#127946; &#129336; <!-- Muscle, weightlifter and sports emojis as placeholder -->
      </div>
    </body>
    </html>
    `;
    
    // Create a Blob with the HTML table content
    const BOM = '\uFEFF'; // Add BOM for UTF-8 encoding to handle Hebrew characters
    const blob = new Blob([BOM + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    
    // Create a temporary link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Generate filename with a random ID
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `יצוא כניסות לחדר כושר_${randomId}.xls`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
      <FileSpreadsheet className="h-4 w-4" />
      <span>ייצוא לאקסל</span>
    </Button>
  );
};

export default ExportEntries;