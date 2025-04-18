
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { Trainee } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  baseService, 
  departmentService, 
  traineeService, 
  adminService 
} from '../services/api';

const Settings = () => {
  const { admin, bases, setBases, departments, setDepartments, trainees, setTrainees } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('departments');
  
  // Medical approval states
  const [medicalFilter, setMedicalFilter] = useState('expired');
  
  // New base
  const [newBaseName, setNewBaseName] = useState('');
  const [newBaseLocation, setNewBaseLocation] = useState('');
  
  // New department
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedBaseForDepartment, setSelectedBaseForDepartment] = useState('');
  
  // New admin
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'generalAdmin' | 'gymAdmin'>('gymAdmin');
  const [selectedBaseForAdmin, setSelectedBaseForAdmin] = useState('');
  
  // Filter trainees based on medical approval status
  const filteredTrainees = useMemo(() => {
    let filtered = [...trainees];
    
    // Filter by base for gym admin
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    switch (medicalFilter) {
      case 'expired':
        return filtered.filter(trainee => 
          !trainee.medicalApproval.approved || 
          (trainee.medicalApproval.expirationDate && 
            new Date(trainee.medicalApproval.expirationDate) < now)
        );
      case 'expiringOneMonth':
        return filtered.filter(trainee => 
          trainee.medicalApproval.approved && 
          trainee.medicalApproval.expirationDate && 
          new Date(trainee.medicalApproval.expirationDate) >= now &&
          new Date(trainee.medicalApproval.expirationDate) <= oneMonthLater
        );
      case 'expiringThreeMonths':
        return filtered.filter(trainee => 
          trainee.medicalApproval.approved && 
          trainee.medicalApproval.expirationDate && 
          new Date(trainee.medicalApproval.expirationDate) >= now &&
          new Date(trainee.medicalApproval.expirationDate) <= threeMonthsLater &&
          new Date(trainee.medicalApproval.expirationDate) > oneMonthLater
        );
      default:
        return filtered;
    }
  }, [admin, trainees, medicalFilter]);
  
  // Get department and base names
  const getDepartmentName = (id: string) => {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  };
  
  const getBaseName = (id: string) => {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  };
  
  // Handle medical approval update
  const updateMedicalApproval = async (traineeId: string, approved: boolean) => {
    try {
      // Create a proper expirationDate (1 year from now)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      
      // Update medical approval via API with the correct object structure
      await traineeService.updateMedicalApproval(traineeId, {
        approved: approved,
        expirationDate: expirationDate.toISOString()
      });
      
      // Update local state to reflect the change
      const updatedTrainees = trainees.map(trainee => {
        if (trainee._id === traineeId) {
          return {
            ...trainee,
            medicalApproval: {
              approved: approved,
              expirationDate: expirationDate.toISOString()
            }
          };
        }
        return trainee;
      });
      
      // Update the state with the modified trainees array
      setTrainees(updatedTrainees);
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
  
  // Handle adding a new base
  const handleAddBase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBaseName.trim() || !newBaseLocation.trim()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create new base via API
      const newBase = await baseService.create({
        name: newBaseName,
        location: newBaseLocation
      });
      
      // Update bases state
      setBases([...bases, newBase]);
      
      // Reset form
      setNewBaseName('');
      setNewBaseLocation('');
      
      toast({
        title: "בסיס חדש נוסף",
        description: `בסיס ${newBase.name} נוסף בהצלחה`,
      });
    } catch (error) {
      console.error('Error adding base:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת הבסיס",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding a new department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDepartmentName.trim() || !selectedBaseForDepartment) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create department via API
      const newDepartment = await departmentService.create({
        name: newDepartmentName,
        baseId: selectedBaseForDepartment
      });
      
      // Update departments state
      setDepartments([...departments, newDepartment]);
      
      // Reset form
      setNewDepartmentName('');
      setSelectedBaseForDepartment('');
      
      toast({
        title: "מסגרת חדשה נוספה",
        description: `מסגרת ${newDepartment.name} נוספה בהצלחה`,
      });
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המסגרת",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminUsername.trim() || !newAdminPassword.trim() || 
        (newAdminRole === 'gymAdmin' && !selectedBaseForAdmin)) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create admin via API
      const adminData = {
        username: newAdminUsername,
        password: newAdminPassword,
        role: newAdminRole,
        ...(newAdminRole === 'gymAdmin' && { baseId: selectedBaseForAdmin })
      };
      
      await adminService.create(adminData);
      
      // Reset form
      setNewAdminUsername('');
      setNewAdminPassword('');
      setNewAdminRole('gymAdmin');
      setSelectedBaseForAdmin('');
      
      toast({
        title: "מנהל חדש נוסף",
        description: `מנהל ${newAdminUsername} נוסף בהצלחה`,
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.response?.data?.message || "אירעה שגיאה בעת הוספת המנהל",
        variant: "destructive",
      });
      console.error('Error adding admin:', error);
    }
  };
  
  // Default tab selection based on admin role
  useEffect(() => {
    if (admin?.role === 'gymAdmin') {
      setActiveTab('medicalApproval');
    }
  }, [admin]);

  return (
    <DashboardLayout activeTab="settings">
      <div className="space-y-6 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">הגדרות</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} style={{display: 'flex', flexDirection: "column", justifyContent: "space-around"}}>
          <TabsList>
            {admin?.role === 'generalAdmin' && (
              <>
                <TabsTrigger value="admins">ניהול מנהלים</TabsTrigger>
                <TabsTrigger value="bases">ניהול בסיסים</TabsTrigger>
              </>
            )}
            <TabsTrigger value="departments">ניהול מסגרות</TabsTrigger>
          </TabsList>
          
         
          
          {/* Departments Tab */}
          <TabsContent value="departments" className="pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                <div className="p-4 bg-muted">
                  <h3 className="font-semibold text-lg" style={{textAlign: "right"}}>מסגרות קיימות</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-right">בסיס</th>
                        <th className="px-4 py-3 text-right">שם המסגרת</th>
                      </tr>
                    </thead>
                    <tbody style={{textAlign: "right"}}>
                      {departments
                        .filter(dept => 
                          admin?.role === 'generalAdmin' || dept.baseId === admin?.baseId
                        )
                        .map((department) => (
                          <tr key={department._id} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-3">{getBaseName(department.baseId)}</td>
                            <td className="px-4 py-3">{department.name}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-card shadow-sm rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-4" style={{textAlign: "right"}}>הוספת מסגרת חדשה</h3>
                <form onSubmit={handleAddDepartment} className="space-y-4">
                  <div>
                    <label htmlFor="departmentName" className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      שם המסגרת
                    </label>
                    <input
                      id="departmentName"
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="input-field"
                      placeholder="הזן שם מסגרת"
                      required
                      autoComplete="off"
                      style={{textAlign: "right"}}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="baseSelect" className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      בסיס
                    </label>
                    <select
                      id="baseSelect"
                      value={selectedBaseForDepartment}
                      onChange={(e) => setSelectedBaseForDepartment(e.target.value)}
                      className="input-field"
                      required
                      style={{textAlign: "right"}}
                    >
                      <option value="">בחר בסיס</option>
                      {bases
                        .filter(base => 
                          admin?.role === 'generalAdmin' || base._id === admin?.baseId
                        )
                        .map(base => (
                          <option key={base._id} value={base._id}>
                            {base.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <button type="submit" className="btn-primary w-full">
                    הוסף מסגרת
                  </button>
                </form>
              </div>
            </div>
          </TabsContent>
          
          {/* Bases Tab (allBasesAdmin only) */}
          {admin?.role === 'generalAdmin' && (
            <TabsContent value="bases" className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2" style={{direction: "rtl"}}>
                <div className="bg-card shadow-sm rounded-lg border p-6" style={{direction: "rtl"}}>
                  <h3 className="font-semibold text-lg mb-4">הוספת בסיס חדש</h3>
                  <form onSubmit={handleAddBase} className="space-y-4">
                    <div>
                      <label htmlFor="baseName" className="block text-sm font-medium mb-1">
                        שם הבסיס
                      </label>
                      <input
                        id="baseName"
                        type="text"
                        value={newBaseName}
                        onChange={(e) => setNewBaseName(e.target.value)}
                        className="input-field"
                        placeholder="הזן שם בסיס"
                        required
                        autoComplete="off"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="baseLocation" className="block text-sm font-medium mb-1">
                        מיקום
                      </label>
                      <input
                        id="baseLocation"
                        type="text"
                        value={newBaseLocation}
                        onChange={(e) => setNewBaseLocation(e.target.value)}
                        className="input-field"
                        placeholder="הזן מיקום"
                        required
                        autoComplete="off"
                      />
                    </div>
                    
                    <button type="submit" className="btn-primary w-full">
                      הוסף בסיס
                    </button>
                  </form>
                </div>
                
                <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                  <div className="p-4 bg-muted" style={{direction: "rtl"}}>
                    <h3 className="font-semibold text-lg" >בסיסים קיימים</h3>
                  </div>
                  <div className="overflow-x-auto" style={{direction: "rtl"}}>
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-right">שם הבסיס</th>
                          <th className="px-4 py-3 text-right">מיקום</th>
                          <th className="px-4 py-3 text-right">מספר מסגרות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bases.map((base) => (
                          <tr key={base._id} className="border-t hover:bg-muted/30" >
                            <td className="px-4 py-3">{base.name}</td>
                            <td className="px-4 py-3">{base.location}</td>
                            <td className="px-4 py-3">
                              {departments.filter(dept => dept.baseId === base._id).length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          
          {/* Admins Tab (allBasesAdmin only) */}
          {admin?.role === 'generalAdmin' && (
            <TabsContent value="admins" className="pt-6" style={{display: "flex",justifyContent: "center"}} >
              <div className="bg-card shadow-sm rounded-lg border p-6" style={{direction: "rtl", width:"510px", }}>
                <h3 className="font-semibold text-lg mb-4">הוספת מנהל חדש</h3>
                <form onSubmit={handleAddAdmin} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="adminUsername" className="block text-sm font-medium mb-1">
                      שם משתמש
                    </label>
                    <input
                      id="adminUsername"
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      className="input-field"
                      placeholder="הזן שם משתמש"
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminPassword" className="block text-sm font-medium mb-1">
                      סיסמה
                    </label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="input-field"
                      placeholder="הזן סיסמה"
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminRole" className="block text-sm font-medium mb-1">
                      סוג מנהל
                    </label>
                    <select
                      id="adminRole"
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as 'generalAdmin' | 'gymAdmin')}
                      className="input-field"
                      required
                    >
                      <option value="generalAdmin">מנהל כללי</option>
                      <option value="gymAdmin">מנהל מכון</option>
                    </select>
                  </div>
                  
                  {newAdminRole === 'gymAdmin' && (
                    <div>
                      <label htmlFor="adminBaseSelect" className="block text-sm font-medium mb-1">
                        בסיס
                      </label>
                      <select
                        id="adminBaseSelect"
                        value={selectedBaseForAdmin}
                        onChange={(e) => setSelectedBaseForAdmin(e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">בחר בסיס</option>
                        {bases.map(base => (
                          <option key={base._id} value={base._id}>
                            {base.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <button type="submit" className="btn-primary w-full">
                    הוסף מנהל
                  </button>
                </form>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
