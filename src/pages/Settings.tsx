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
  const { admin, bases, setBases, departments, setDepartments, trainees } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('medicalApproval');
  
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
      // Update medical approval via API
      await traineeService.updateMedicalApproval(traineeId, approved);
      
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
        title: "מחלקה חדשה נוספה",
        description: `מחלקה ${newDepartment.name} נוספה בהצלחה`,
      });
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המחלקה",
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="medicalApproval">ניהול אישורים רפואיים</TabsTrigger>
            <TabsTrigger value="departments">ניהול מחלקות</TabsTrigger>
            {admin?.role === 'generalAdmin' && (
              <>
                <TabsTrigger value="bases">ניהול בסיסים</TabsTrigger>
                <TabsTrigger value="admins">ניהול מנהלים</TabsTrigger>
              </>
            )}
          </TabsList>
          
          {/* Medical Approval Tab */}
          <TabsContent value="medicalApproval" className="pt-6">
            <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
              <div className="p-4 bg-muted">
                <h3 className="font-semibold text-lg">ניהול אישורים רפואיים</h3>
                <p className="text-muted-foreground">צפה במתאמנים ללא אישור רפואי או עם אישור שעומד לפוג</p>
                
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => setMedicalFilter('expired')}
                    className={`px-4 py-2 rounded-md ${
                      medicalFilter === 'expired' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    ללא אישור תקף
                  </button>
                  <button
                    onClick={() => setMedicalFilter('expiringOneMonth')}
                    className={`px-4 py-2 rounded-md ${
                      medicalFilter === 'expiringOneMonth' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    פג תוך חודש
                  </button>
                  <button
                    onClick={() => setMedicalFilter('expiringThreeMonths')}
                    className={`px-4 py-2 rounded-md ${
                      medicalFilter === 'expiringThreeMonths' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    פג תוך 3 חודשים
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-right">שם מתאמן</th>
                      <th className="px-4 py-3 text-right">מספר אישי</th>
                      <th className="px-4 py-3 text-right">מחלקה</th>
                      {admin?.role === 'generalAdmin' && (
                        <th className="px-4 py-3 text-right">בסיס</th>
                      )}
                      <th className="px-4 py-3 text-right">סטטוס אישור</th>
                      <th className="px-4 py-3 text-right">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrainees.length > 0 ? (
                      filteredTrainees.map((trainee) => (
                        <tr key={trainee._id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-3">{trainee.fullName}</td>
                          <td className="px-4 py-3">{trainee.personalId}</td>
                          <td className="px-4 py-3">{getDepartmentName(trainee.departmentId)}</td>
                          {admin?.role === 'generalAdmin' && (
                            <td className="px-4 py-3">{getBaseName(trainee.baseId)}</td>
                          )}
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              trainee.medicalApproval.approved 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {trainee.medicalApproval.approved 
                                ? `פג בתאריך ${new Date(trainee.medicalApproval.expirationDate!).toLocaleDateString()}` 
                                : 'אין אישור תקף'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => updateMedicalApproval(trainee._id, true)}
                              className="btn-primary text-sm py-1"
                            >
                              אישור לשנה
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan={admin?.role === 'generalAdmin' ? 6 : 5} 
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          לא נמצאו רשומות מתאימות
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Departments Tab */}
          <TabsContent value="departments" className="pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-card shadow-sm rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-4">הוספת מחלקה חדשה</h3>
                <form onSubmit={handleAddDepartment} className="space-y-4">
                  <div>
                    <label htmlFor="departmentName" className="block text-sm font-medium mb-1">
                      שם המחלקה
                    </label>
                    <input
                      id="departmentName"
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="input-field"
                      placeholder="הזן שם מחלקה"
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="baseSelect" className="block text-sm font-medium mb-1">
                      בסיס
                    </label>
                    <select
                      id="baseSelect"
                      value={selectedBaseForDepartment}
                      onChange={(e) => setSelectedBaseForDepartment(e.target.value)}
                      className="input-field"
                      required
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
                    הוסף מחלקה
                  </button>
                </form>
              </div>
              
              <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                <div className="p-4 bg-muted">
                  <h3 className="font-semibold text-lg">מחלקות קיימות</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-right">שם המחלקה</th>
                        <th className="px-4 py-3 text-right">בסיס</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments
                        .filter(dept => 
                          admin?.role === 'generalAdmin' || dept.baseId === admin?.baseId
                        )
                        .map((department) => (
                          <tr key={department._id} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-3">{department.name}</td>
                            <td className="px-4 py-3">{getBaseName(department.baseId)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Bases Tab (allBasesAdmin only) */}
          {admin?.role === 'generalAdmin' && (
            <TabsContent value="bases" className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="bg-card shadow-sm rounded-lg border p-6">
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
                  <div className="p-4 bg-muted">
                    <h3 className="font-semibold text-lg">בסיסים קיימים</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-right">שם הבסיס</th>
                          <th className="px-4 py-3 text-right">מיקום</th>
                          <th className="px-4 py-3 text-right">מספר מחלקות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bases.map((base) => (
                          <tr key={base._id} className="border-t hover:bg-muted/30">
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
            <TabsContent value="admins" className="pt-6">
              <div className="bg-card shadow-sm rounded-lg border p-6">
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