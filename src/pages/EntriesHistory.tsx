import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { Entry, Trainee } from '../types';
import { traineeService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EntriesHistory = () => {
  const { admin, entries, trainees, departments, bases } = useAdmin();
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter entries based on admin role
  useEffect(() => {
    let filtered = [...entries];
    
    // Filter by base if the admin is a gym admin
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    
    setFilteredEntries(filtered);
  }, [admin, entries]);

  // Apply filters
  useEffect(() => {
    let filtered = [...entries];
    
    // Filter by base if the admin is a gym admin
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.traineeFullName.includes(searchTerm)
      );
    }
    
    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(entry => entry.departmentId === selectedDepartment);
    }
    
    // Apply base filter (only for all bases admin)
    if (admin?.role === 'generalAdmin' && selectedBase) {
      filtered = filtered.filter(entry => entry.baseId === selectedBase);
    }
    
    // Apply profile filter
    if (selectedProfile) {
      const traineesWithProfile = trainees.filter(
        trainee => trainee.medicalProfile === selectedProfile
      ).map(trainee => trainee._id);
      
      filtered = filtered.filter(entry =>
        traineesWithProfile.includes(entry.traineeId)
      );
    }
    
    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(entry => entry.entryDate === selectedDate);
    }
    
    setFilteredEntries(filtered);
  }, [admin, entries, searchTerm, selectedDepartment, selectedBase, selectedProfile, selectedDate, trainees]);

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

  // Prepare data for trainee analytics
  const getTraineeAnalytics = (traineeId: string) => {
    const traineeEntries = entries.filter(entry => entry.traineeId === traineeId);
    
    // Entry times distribution
    const hourCounts: { [key: string]: number } = {};
    traineeEntries.forEach(entry => {
      const hour = entry.entryTime.split(':')[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const hourData = Object.keys(hourCounts).map(hour => ({
      name: `${hour}:00`,
      count: hourCounts[hour],
    })).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    
    // Day of week distribution
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayCounts: { [key: string]: number } = {};
    
    traineeEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayOfWeek = dayNames[date.getDay()];
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
    });
    
    const dayData = dayNames.map(day => ({
      name: day,
      count: dayCounts[day] || 0,
    }));
    
    // Average entries per month
    const monthlyAverage = traineeEntries.length / 
      (new Set(traineeEntries.map(e => e.entryDate.substring(0, 7))).size || 1);
    
    // Percentile among all trainees
    const allTraineeEntryCounts = trainees.map(t => {
      const count = entries.filter(e => e.traineeId === t._id).length;
      return { traineeId: t._id, count };
    }).sort((a, b) => b.count - a.count);
    
    const rank = allTraineeEntryCounts.findIndex(t => t.traineeId === traineeId) + 1;
    const percentile = Math.round((1 - (rank / trainees.length)) * 100);
    
    return {
      hourData,
      dayData,
      monthlyAverage: monthlyAverage.toFixed(1),
      percentile: percentile > 0 ? percentile : 0,
      totalEntries: traineeEntries.length,
    };
  };

  const updateMedicalApproval = async (approved: boolean) => {
    if (!selectedTrainee) return;
    
    try {
      // Update medical approval via API
      const updatedTrainee = await traineeService.updateMedicalApproval(
        selectedTrainee._id, 
        approved
      );
      
      // Update the selected trainee state
      setSelectedTrainee(updatedTrainee);
      
      toast({
        title: approved ? "אישור רפואי עודכן" : "אישור רפואי בוטל",
        description: approved 
          ? "האישור הרפואי עודכן בהצלחה לשנה" 
          : "האישור הרפואי בוטל בהצלחה",
      });
    } catch (error) {
      console.error('Error updating medical approval:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון האישור הרפואי",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout activeTab="entries">
      <div className="space-y-6 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">היסטוריית כניסות</h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-secondary rounded-lg">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">חיפוש לפי שם</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש מתאמן..."
              className="input-field"
              autoComplete="off"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1">סינון לפי מחלקה</label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
            >
              <option value="">כל המחלקות</option>
              {departments
                .filter(dept => 
                  admin?.role === 'generalAdmin' || 
                  dept.baseId === admin?.baseId
                )
                .map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))
              }
            </select>
          </div>
          
          {admin?.role === 'generalAdmin' && (
            <div>
              <label htmlFor="base" className="block text-sm font-medium mb-1">סינון לפי בסיס</label>
              <select
                id="base"
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="input-field"
              >
                <option value="">כל הבסיסים</option>
                {bases.map(base => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="profile" className="block text-sm font-medium mb-1">סינון לפי פרופיל</label>
            <select
              id="profile"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="input-field"
            >
              <option value="">כל הפרופילים</option>
              <option value="97">97</option>
              <option value="82">82</option>
              <option value="72">72</option>
              <option value="64">64</option>
              <option value="45">45</option>
              <option value="25">25</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">סינון לפי תאריך</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">שם מתאמן</th>
                  <th className="px-4 py-3 text-right">מספר אישי</th>
                  <th className="px-4 py-3 text-right">מחלקה</th>
                  {admin?.role === 'generalAdmin' && (
                    <th className="px-4 py-3 text-right">בסיס</th>
                  )}
                  <th className="px-4 py-3 text-right">תאריך</th>
                  <th className="px-4 py-3 text-right">שעה</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr 
                      key={entry._id} 
                      className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleTraineeClick(entry.traineeId)}
                    >
                      <td className="px-4 py-3">{entry.traineeFullName}</td>
                      <td className="px-4 py-3">{entry.traineePersonalId}</td>
                      <td className="px-4 py-3">{getDepartmentName(entry.departmentId)}</td>
                      {admin?.role === 'generalAdmin' && (
                        <td className="px-4 py-3">{getBaseName(entry.baseId)}</td>
                      )}
                      <td className="px-4 py-3">{entry.entryDate}</td>
                      <td className="px-4 py-3">{entry.entryTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={admin?.role === 'generalAdmin' ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                      לא נמצאו רשומות
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Trainee Details Dialog */}
      {selectedTrainee && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTrainee.fullName}</DialogTitle>
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
                    
                    <div className="text-sm text-muted-foreground">מספר טלפון:</div>
                    <div>{selectedTrainee.phoneNumber}</div>
                    
                    <div className="text-sm text-muted-foreground">אישור רפואי:</div>
                    <div className={selectedTrainee.medicalApproval.approved ? "text-green-600" : "text-red-600"}>
                      {selectedTrainee.medicalApproval.approved 
                        ? `בתוקף עד ${new Date(selectedTrainee.medicalApproval.expirationDate!).toLocaleDateString()}` 
                        : "לא בתוקף"}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => updateMedicalApproval(true)}
                      className="btn-primary"
                    >
                      אישור רפואי לשנה
                    </button>
                    <button
                      onClick={() => updateMedicalApproval(false)}
                      className="btn-secondary"
                    >
                      ביטול אישור רפואי
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedTrainee && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">התפלגות ימי אימון</h3>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart 
                          data={getTraineeAnalytics(selectedTrainee._id).dayData} 
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">התפלגות שעות אימון</h3>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart 
                          data={getTraineeAnalytics(selectedTrainee._id).hourData} 
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
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
                        <div className="text-sm text-muted-foreground">אחוזון המתאמנים</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default EntriesHistory;