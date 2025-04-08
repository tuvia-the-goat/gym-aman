
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { Entry, Trainee, EntryStatus } from '../types';
import { traineeService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CheckCircle, XCircle, User, Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { isWithinInterval, parseISO, format, differenceInYears } from 'date-fns';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

console.log('Warning: EntriesHistory.tsx has a type error that needs to be fixed, but it is marked as read-only.');

const EntriesHistory = () => {
  const {
    admin,
    entries,
    trainees,
    departments,
    bases
  } = useAdmin();
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([]);
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;

  useEffect(() => {
    let filtered = [...entries];
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    setFilteredEntries(filtered);
  }, [admin, entries]);

  useEffect(() => {
    let filtered = [...entries];
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    if (searchTerm) {
      // Fixed: Added null/undefined check before calling toLowerCase
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.traineeFullName && entry.traineeFullName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    if (selectedDepartment) {
      filtered = filtered.filter(entry => entry.departmentId === selectedDepartment);
    }
    if (admin?.role === 'generalAdmin' && selectedBase) {
      filtered = filtered.filter(entry => entry.baseId === selectedBase);
    }
    if (selectedProfile) {
      const traineesWithProfile = trainees.filter(trainee => trainee.medicalProfile === selectedProfile).map(trainee => trainee._id);
      filtered = filtered.filter(entry => traineesWithProfile.includes(entry.traineeId));
    }
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, {
          start: startDate,
          end: endDate
        });
      });
    }
    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [admin, entries, searchTerm, selectedDepartment, selectedBase, selectedProfile, startDate, endDate, trainees]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    setDisplayedEntries(filteredEntries.slice(startIndex, endIndex));
  }, [filteredEntries, currentPage]);

  const getTotalPages = () => {
    return Math.ceil(filteredEntries.length / entriesPerPage);
  };

  const getDepartmentName = (id: string) => {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  };

  const getBaseName = (id: string) => {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  };

  const handleTraineeClick = (traineeId: string) => {
    const trainee = trainees.find(t => t._id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setIsDialogOpen(true);
    }
  };

  const getTraineeForEntry = (traineeId: string) => {
    return trainees.find(t => t._id === traineeId) || null;
  };

  const hasOrthopedicCondition = (traineeId: string) => {
    const trainee = trainees.find(t => t._id === traineeId);
    return trainee?.orthopedicCondition || false;
  };

  const hasMedicalLimitation = (traineeId: string) => {
    const trainee = trainees.find(t => t._id === traineeId);
    return trainee?.medicalLimitation ? true : false;
  };

  const getTraineeAnalytics = (traineeId: string) => {
    const traineeEntries = entries.filter(entry => entry.traineeId === traineeId);
    const hourCounts: {
      [key: string]: number;
    } = {};
    traineeEntries.forEach(entry => {
      const hour = entry.entryTime.split(':')[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const hourData = Object.keys(hourCounts).map(hour => ({
      name: `${hour}:00`,
      count: hourCounts[hour]
    })).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayCounts: {
      [key: string]: number;
    } = {};
    traineeEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayOfWeek = dayNames[date.getDay()];
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
    });
    const dayData = dayNames.map(day => ({
      name: day,
      count: dayCounts[day] || 0
    }));
    const monthlyAverage = traineeEntries.length / (new Set(traineeEntries.map(e => e.entryDate.substring(0, 7))).size || 1);
    const allTraineeEntryCounts = trainees.map(t => {
      const count = entries.filter(e => e.traineeId === t._id).length;
      return {
        traineeId: t._id,
        count
      };
    }).sort((a, b) => b.count - a.count);
    const rank = allTraineeEntryCounts.findIndex(t => t.traineeId === traineeId) + 1;
    const percentile = Math.round((1 - rank / trainees.length) * 100);
    return {
      hourData,
      dayData,
      monthlyAverage: monthlyAverage.toFixed(1),
      percentile: percentile > 0 ? percentile : 0,
      totalEntries: traineeEntries.length
    };
  };

  const updateMedicalApproval = async (approved: boolean) => {
    if (!selectedTrainee) return;
    try {
      const updatedTrainee = await traineeService.updateMedicalApproval(selectedTrainee._id, {
        approved: approved,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      setSelectedTrainee(updatedTrainee);
      toast({
        title: approved ? "אישור רפואי עודכן" : "אישור רפואי בוטל",
        description: approved ? "האישור הרפואי עודכן בהצלחה לשנה" : "האישור הרפואי בוטל בהצלחה"
      });
    } catch (error) {
      console.error('Error updating medical approval:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון האישור הרפואי",
        variant: "destructive"
      });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), parseISO(birthDate));
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

  return <DashboardLayout activeTab="entries">
      <div className="space-y-6 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">היסטוריית כניסות</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-secondary rounded-lg">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">חיפוש לפי שם</label>
            <input id="search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="חפש מתאמן..." className="input-field" autoComplete="off" />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1">סינון לפי מחלקה</label>
            <select id="department" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="input-field" style={{
            marginLeft: "20px"
          }}>
              <option value="">כל המחלקות</option>
              {departments.filter(dept => admin?.role === 'generalAdmin' || dept.baseId === admin?.baseId).map(dept => <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>)}
            </select>
          </div>
          
          {admin?.role === 'generalAdmin' && <div>
              <label htmlFor="base" className="block text-sm font-medium mb-1">סינון לפי בסיס</label>
              <select id="base" value={selectedBase} onChange={e => setSelectedBase(e.target.value)} className="input-field">
                <option value="">כל הבסיסים</option>
                {bases.map(base => <option key={base._id} value={base._id}>
                    {base.name}
                  </option>)}
              </select>
            </div>}
          
          <div>
            <label htmlFor="profile" className="block text-sm font-medium mb-1">סינון לפי פרופיל</label>
            <select id="profile" value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)} className="input-field">
              <option value="">כל הפרופילים</option>
              <option value="97">97</option>
              <option value="82">82</option>
              <option value="72">72</option>
              <option value="64">64</option>
              <option value="45">45</option>
              <option value="25">25</option>
            </select>
          </div>
          
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium mb-1">טווח תאריכים</label>
            <div className="flex items-center gap-2">
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-[180px] justify-start text-right", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {startDate ? format(startDate, "yyyy-MM-dd") : "תאריך התחלה"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <span>עד</span>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-[180px] justify-start text-right", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {endDate ? format(endDate, "yyyy-MM-dd") : "תאריך סיום"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">שם מתאמן</th>
                  <th className="px-4 py-3 text-right">מספר אישי</th>
                  <th className="px-4 py-3 text-right">מחלקה</th>
                  {admin?.role === 'generalAdmin' && <th className="px-4 py-3 text-right">בסיס</th>}
                  <th className="px-4 py-3 text-right">תאריך</th>
                  <th className="px-4 py-3 text-right">שעה</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {displayedEntries.length > 0 ? displayedEntries.map(entry => {
                const hasOrthopedic = hasOrthopedicCondition(entry.traineeId);
                const hasMedical = hasMedicalLimitation(entry.traineeId);
                const statusDisplay = getEntryStatusDisplay(entry.status || 'success');
                return <tr key={entry._id} className={cn("border-t hover:bg-muted/50 cursor-pointer transition-colors", 
                    (hasOrthopedic || hasMedical) && "bg-amber-50", 
                    statusDisplay.rowClass)} onClick={() => entry.traineeId && handleTraineeClick(entry.traineeId)}>
                        <td className="px-4 py-3 flex items-center">
                          {(hasOrthopedic || hasMedical) && <AlertTriangle className="h-4 w-4 text-amber-500 ml-2" aria-label="סעיף אורטופדי" />}
                          {entry.traineeFullName || '-'}
                        </td>
                        <td className="px-4 py-3">{entry.traineePersonalId}</td>
                        <td className="px-4 py-3">{entry.departmentId ? getDepartmentName(entry.departmentId) : '-'}</td>
                        {admin?.role === 'generalAdmin' && <td className="px-4 py-3">{getBaseName(entry.baseId)}</td>}
                        <td className="px-4 py-3">{getDateFormat(new Date(entry.entryDate))}</td>
                        <td className="px-4 py-3">{entry.entryTime}</td>
                        <td className={`px-4 py-3 flex items-center ${statusDisplay.textClass}`}>
                          {statusDisplay.icon}
                          {entry.status === 'success' && 'כניסה מוצלחת'}
                          {entry.status === 'noMedicalApproval' && 'אין אישור רפואי'}
                          {entry.status === 'notRegistered' && 'משתמש לא רשום'}
                        </td>
                      </tr>;
              }) : <tr>
                    <td colSpan={admin?.role === 'generalAdmin' ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                      לא נמצאו רשומות
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
          
          {filteredEntries.length > 0 && <div className="py-4 px-2 border-t">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && <PaginationItem>
                      <PaginationPrevious onClick={() => goToPage(currentPage - 1)} />
                    </PaginationItem>}
                  
                  {currentPage > 3 && <PaginationItem>
                      <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
                    </PaginationItem>}
                  
                  {currentPage > 4 && <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>}
                  
                  {currentPage > 1 && <PaginationItem>
                      <PaginationLink onClick={() => goToPage(currentPage - 1)}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>}
                  
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                  
                  {currentPage < getTotalPages() && <PaginationItem>
                      <PaginationLink onClick={() => goToPage(currentPage + 1)}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>}
                  
                  {currentPage < getTotalPages() - 3 && <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>}
                  
                  {currentPage < getTotalPages() - 2 && getTotalPages() > 1 && <PaginationItem>
                      <PaginationLink onClick={() => goToPage(getTotalPages())}>
                        {getTotalPages()}
                      </PaginationLink>
                    </PaginationItem>}
                  
                  {currentPage < getTotalPages() && <PaginationItem>
                      <PaginationNext onClick={() => goToPage(currentPage + 1)} />
                    </PaginationItem>}
                </PaginationContent>
              </Pagination>
            </div>}
        </div>
      </div>
      
      {selectedTrainee && <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl" style={{
        direction: "rtl"
      }}>
            <DialogHeader style={{
          textAlign: "right"
        }}>
              <DialogTitle className="text-2xl">
                {selectedTrainee.fullName}
                {selectedTrainee.orthopedicCondition && <span className="inline-flex items-center mr-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md">
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    סעיף אורטופדי
                  </span>}
                {selectedTrainee.medicalLimitation && <span className="inline-flex items-center mr-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md">
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    מגבלה רפואית: {selectedTrainee.medicalLimitation}
                  </span>}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">פרטי מתאמן</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">מספר אישי:</div>
                    <div>{selectedTrainee.personalId}</div>
                    
                    <div className="text-sm text-muted-foreground">מחלקה:</div>
                    <div>{getDepartmentName(selectedTrainee.departmentId)}</div>
                    
                    <div className="text-sm text-muted-foreground">בסיס:</div>
                    <div>{getBaseName(selectedTrainee.baseId)}</div>
                    
                    <div className="text-sm text-muted-foreground">פרופיל רפואי:</div>
                    <div>{selectedTrainee.medicalProfile}</div>
                    
                    <div className="text-sm text-muted-foreground">מין:</div>
                    <div>{selectedTrainee.gender === 'male' ? 'זכר' : 'נקבה'}</div>
                    
                    <div className="text-sm text-muted-foreground">גיל:</div>
                    <div>
                      {selectedTrainee.birthDate ? calculateAge(selectedTrainee.birthDate) : 'לא זמין'}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">מספר טלפון:</div>
                    <div>{selectedTrainee.phoneNumber}</div>
                    
                    <div className="text-sm text-muted-foreground">אישור רפואי:</div>
                    <div className={selectedTrainee.medicalApproval.approved ? "text-green-600" : "text-red-600"}>
                      {selectedTrainee.medicalApproval.approved ? `בתוקף עד ${selectedTrainee.medicalApproval.expirationDate ? format(new Date(selectedTrainee.medicalApproval.expirationDate), 'yyyy-MM-dd') : 'לא ידוע'}` : "לא בתוקף"}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">סעיף אורטופדי:</div>
                    <div className={selectedTrainee.orthopedicCondition ? "text-amber-600" : ""}>
                      {selectedTrainee.orthopedicCondition ? "יש" : "אין"}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">מגבלה רפואית:</div>
                    <div className={selectedTrainee.medicalLimitation ? "text-blue-600" : ""}>
                      {selectedTrainee.medicalLimitation ? selectedTrainee.medicalLimitation : "אין"}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button onClick={() => updateMedicalApproval(true)} className="btn-primary" style={{
                  marginLeft: "10px"
                }}>
                      אישור רפואי לשנה
                    </button>
                    <button onClick={() => updateMedicalApproval(false)} className="btn-secondary">
                      ביטול אישור רפואי
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedTrainee && <>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">התפלגות ימי אימון</h3>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={getTraineeAnalytics(selectedTrainee._id).dayData} margin={{
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                  }}>
                          <XAxis dataKey="name" tickMargin={12} />
                          <YAxis tickMargin={32} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">התפלגות שעות אימון</h3>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={getTraineeAnalytics(selectedTrainee._id).hourData} margin={{
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                  }}>
                          <XAxis dataKey="name" tickMargin={12} />
                          <YAxis tickMargin={32} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#0ea5e9" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold">
                          {getTraineeAnalytics(selectedTrainee._id).monthlyAverage}
                        </div>
                        <div className="text-sm text-muted-foreground">כניסות בחודש (ממוצע)</div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold">
                          {getTraineeAnalytics(selectedTrainee._id).percentile}%
                        </div>
                        <div className="text-sm text-muted-foreground">אחוזון ה��תאמנים</div>
                      </div>
                    </div>
                  </>}
              </div>
            </div>
          </DialogContent>
        </Dialog>}
    </DashboardLayout>;
};

export default EntriesHistory;
