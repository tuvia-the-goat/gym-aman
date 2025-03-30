
import React, { useMemo, useState } from 'react';
import { format, isWithinInterval, parseISO, addMonths } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const Analytics = () => {
  const { admin, entries, trainees, departments, bases } = useAdmin();
  
  // Filtering state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // Filter data based on admin role and filters
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    
    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }
    
    // Department filter
    if (selectedDepartmentId) {
      filtered = filtered.filter(entry => entry.departmentId === selectedDepartmentId);
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(entry => selectedTrainees.includes(entry.traineeId));
    }
    
    return filtered;
  }, [admin, entries, startDate, endDate, selectedDepartmentId, selectedTrainees]);
  
  const filteredTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    // Department filter
    if (selectedDepartmentId) {
      filtered = filtered.filter(trainee => trainee.departmentId === selectedDepartmentId);
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(trainee => selectedTrainees.includes(trainee._id));
    }
    
    return filtered;
  }, [admin, trainees, selectedDepartmentId, selectedTrainees]);
  
  // Get available departments for filtering
  const availableDepartments = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return departments.filter(dept => dept.baseId === admin.baseId);
    }
    return departments;
  }, [admin, departments]);
  
  // Get available trainees for filtering
  const availableTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    // Department filter
    if (selectedDepartmentId) {
      filtered = filtered.filter(trainee => trainee.departmentId === selectedDepartmentId);
    }
    
    return filtered;
  }, [admin, trainees, selectedDepartmentId]);
  
  // Check if specific filters are active
  const hasSpecificFilters = selectedDepartmentId || selectedTrainees.length > 0;
  
  // Data for days of week chart
  const weekdaysData = useMemo(() => {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayIndex = date.getDay();
      dayCounts[dayIndex]++;
    });
    
    return dayNames.map((day, index) => ({
      name: day,
      value: dayCounts[index],
    }));
  }, [filteredEntries]);
  
  // Data for monthly entries
  const monthlyData = useMemo(() => {
    const monthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    
    const monthCounts = Array(12).fill(0);
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const monthIndex = date.getMonth();
      monthCounts[monthIndex]++;
    });
    
    return monthNames.map((month, index) => ({
      name: month,
      value: monthCounts[index],
    }));
  }, [filteredEntries]);
  
  // Top trainees data
  const topTraineesData = useMemo(() => {
    const traineeCounts = filteredTrainees.map(trainee => {
      const count = filteredEntries.filter(entry => entry.traineeId === trainee._id).length;
      return { 
        id: trainee._id, 
        name: trainee.fullName, 
        count, 
        departmentId: trainee.departmentId,
        baseId: trainee.baseId
      };
    });
    
    return traineeCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(trainee => ({
        name: trainee.name,
        value: trainee.count,
        departmentName: getDepartmentName(trainee.departmentId),
        baseName: getBaseName(trainee.baseId)
      }));
  }, [filteredEntries, filteredTrainees]);
  
  // Top departments data
  const topDepartmentsData = useMemo(() => {
    const departmentCounts: { [key: string]: number } = {};
    
    filteredEntries.forEach(entry => {
      const deptId = entry.departmentId;
      departmentCounts[deptId] = (departmentCounts[deptId] || 0) + 1;
    });
    
    return Object.entries(departmentCounts)
      .map(([deptId, count]) => ({
        id: deptId,
        name: getDepartmentName(deptId),
        value: count,
        baseId: departments.find(d => d._id === deptId)?.baseId || '',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(dept => ({
        name: dept.name,
        value: dept.value,
        baseName: getBaseName(dept.baseId)
      }));
  }, [filteredEntries, departments]);
  
  // Bases data (only for all bases admin)
  const basesData = useMemo(() => {
    if (admin?.role !== 'generalAdmin') return [];
    
    const baseCounts: { [key: string]: number } = {};
    
    filteredEntries.forEach(entry => {
      const baseId = entry.baseId;
      baseCounts[baseId] = (baseCounts[baseId] || 0) + 1;
    });
    
    return Object.entries(baseCounts)
      .map(([baseId, count]) => ({
        name: getBaseName(baseId),
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [admin, filteredEntries]);
  
  // Average entries per trainee
  const avgEntriesPerTrainee = useMemo(() => {
    if (filteredTrainees.length === 0) return 0;
    return (filteredEntries.length / filteredTrainees.length).toFixed(1);
  }, [filteredEntries, filteredTrainees]);
  
  // Helper functions to get names
  function getDepartmentName(id: string): string {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  }
  
  function getBaseName(id: string): string {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  }
  
  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDepartmentId('');
    setSelectedTrainees([]);
  };
  
  // Handle trainee selection toggle
  const toggleTrainee = (traineeId: string) => {
    setSelectedTrainees(prev => 
      prev.includes(traineeId) 
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  };
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A478E8'];

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-8 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">אנליטיקות</h2>
          <div className="flex items-center gap-2">
            {(startDate || endDate || selectedDepartmentId || selectedTrainees.length > 0) && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
                <X size={16} />
                נקה סינון
              </Button>
            )}
            <Button onClick={() => setShowFilterDialog(true)} variant="outline" className="flex items-center gap-1">
              <FilterIcon size={16} />
              סינון
            </Button>
          </div>
        </div>
        
        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-center">סינון אנליטיקות</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <h3 className="font-medium">טווח תאריכים</h3>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <p className="text-sm mb-1">מתאריך:</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : "בחר תאריך"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-1/2">
                    <p className="text-sm mb-1">עד תאריך:</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy") : "בחר תאריך"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">מחלקה</h3>
                <Select 
                  value={selectedDepartmentId} 
                  onValueChange={setSelectedDepartmentId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר מחלקה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כל המחלקות</SelectItem>
                    {availableDepartments.map(dept => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name} {admin?.role === 'generalAdmin' && `(${getBaseName(dept.baseId)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">בחירת מתאמנים</h3>
                <div className="max-h-56 overflow-y-auto border rounded-md p-2">
                  {availableTrainees.length === 0 ? (
                    <p className="text-center py-2 text-muted-foreground">אין מתאמנים זמינים</p>
                  ) : (
                    <div className="space-y-2">
                      {availableTrainees.map(trainee => (
                        <div key={trainee._id} className="flex items-center space-x-2 justify-end">
                          <label htmlFor={`trainee-${trainee._id}`} className="text-sm cursor-pointer mr-2">
                            {trainee.fullName}
                          </label>
                          <Checkbox 
                            id={`trainee-${trainee._id}`}
                            checked={selectedTrainees.includes(trainee._id)}
                            onCheckedChange={() => toggleTrainee(trainee._id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedTrainees.length > 0 && (
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedTrainees([])}
                    >
                      נקה בחירה
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedTrainees.length} נבחרו
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={clearFilters}>
                נקה הכל
              </Button>
              <DialogClose asChild>
                <Button>אישור</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Active Filters Display */}
        {(startDate || endDate || selectedDepartmentId || selectedTrainees.length > 0) && (
          <div className="bg-muted p-3 rounded-lg flex flex-wrap gap-2 items-center">
            <span className="font-medium ml-2">סינון פעיל:</span>
            
            {(startDate || endDate) && (
              <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
                <span>תאריכים: </span>
                {startDate ? format(startDate, "dd/MM/yyyy") : "כל התאריכים"} 
                {startDate && endDate ? " - " : ""}
                {endDate ? format(endDate, "dd/MM/yyyy") : ""}
                <button onClick={() => { setStartDate(undefined); setEndDate(undefined); }} className="mr-1 hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            )}
            
            {selectedDepartmentId && (
              <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
                <span>מחלקה: </span>
                {getDepartmentName(selectedDepartmentId)}
                <button onClick={() => setSelectedDepartmentId('')} className="mr-1 hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            )}
            
            {selectedTrainees.length > 0 && (
              <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
                <span>מתאמנים: </span>
                {selectedTrainees.length} נבחרו
                <button onClick={() => setSelectedTrainees([])} className="mr-1 hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card shadow-sm rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-2">סך הכל כניסות</h3>
            <p className="text-4xl font-bold">{filteredEntries.length}</p>
          </div>
          
          <div className="bg-card shadow-sm rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-2">סך הכל מתאמנים</h3>
            <p className="text-4xl font-bold">{filteredTrainees.length}</p>
          </div>
          
          <div className="bg-card shadow-sm rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-2">ממוצע כניסות למתאמן</h3>
            <p className="text-4xl font-bold">{avgEntriesPerTrainee}</p>
          </div>
        </div>
        
        {/* Main Charts - only show if no specific filters active */}
        {!hasSpecificFilters && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entries by Day of Week */}
            <div className="bg-card shadow-sm rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-4">כניסות לפי ימים בשבוע</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdaysData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickMargin={40}/>
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Monthly Entries */}
            <div className="bg-card shadow-sm rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-4">כניסות לפי חודשים</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickMargin={20}/>
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Top Trainees and Departments - only show if no specific filters active */}
        {!hasSpecificFilters && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Trainees */}
            <div className="bg-card shadow-sm rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-4">5 המתאמנים המובילים</h3>
              {topTraineesData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={topTraineesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number"/>
                        <YAxis dataKey="name" type="category" width={150} tickMargin={100}/>
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-right">שם</th>
                          <th className="px-4 py-2 text-right">מחלקה</th>
                          {admin?.role === 'generalAdmin' && (
                            <th className="px-4 py-2 text-right">בסיס</th>
                          )}
                          <th className="px-4 py-2 text-right">כניסות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topTraineesData.map((trainee, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{trainee.name}</td>
                            <td className="px-4 py-2">{trainee.departmentName}</td>
                            {admin?.role === 'generalAdmin' && (
                              <td className="px-4 py-2">{trainee.baseName}</td>
                            )}
                            <td className="px-4 py-2">{trainee.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">אין נתונים זמינים</p>
              )}
            </div>
            
            {/* Top Departments */}
            <div className="bg-card shadow-sm rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-4">5 המחלקות המובילות</h3>
              {topDepartmentsData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topDepartmentsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {topDepartmentsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-right">מחלקה</th>
                          {admin?.role === 'generalAdmin' && (
                            <th className="px-4 py-2 text-right">בסיס</th>
                          )}
                          <th className="px-4 py-2 text-right">כניסות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topDepartmentsData.map((dept, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{dept.name}</td>
                            {admin?.role === 'generalAdmin' && (
                              <td className="px-4 py-2">{dept.baseName}</td>
                            )}
                            <td className="px-4 py-2">{dept.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">אין נתונים זמינים</p>
              )}
            </div>
          </div>
        )}
        
        {/* Bases Chart (only for allBasesAdmin) and no specific filters */}
        {admin?.role === 'generalAdmin' && !hasSpecificFilters && basesData.length > 0 && (
          <div className="bg-card shadow-sm rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-4">כניסות לפי בסיסים</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={basesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
