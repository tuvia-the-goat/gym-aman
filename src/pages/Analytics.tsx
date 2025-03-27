
import React, { useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const { admin, entries, trainees, departments, bases } = useAdmin();
  
  // Filter data based on admin role
  const filteredEntries = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return entries.filter(entry => entry.baseId === admin.baseId);
    }
    return entries;
  }, [admin, entries]);
  
  const filteredTrainees = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return trainees.filter(trainee => trainee.baseId === admin.baseId);
    }
    return trainees;
  }, [admin, trainees]);
  
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
    
    entries.forEach(entry => {
      const baseId = entry.baseId;
      baseCounts[baseId] = (baseCounts[baseId] || 0) + 1;
    });
    
    return Object.entries(baseCounts)
      .map(([baseId, count]) => ({
        name: getBaseName(baseId),
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [admin, entries]);
  
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
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A478E8'];

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-8 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">אנליטיקות</h2>
        </div>
        
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
        
        {/* Main Charts */}
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
        
        {/* Top Trainees and Departments */}
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
        
        {/* Bases Chart (only for allBasesAdmin) */}
        {admin?.role === 'generalAdmin' && basesData.length > 0 && (
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
