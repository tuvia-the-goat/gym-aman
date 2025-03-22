import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Department, Base, Trainee } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { baseService, departmentService, traineeService, entryService } from '../services/api';
import { Button } from '@/components/ui/button';

const Registration = () => {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const { toast } = useToast();

  // מצב טעינת הנתונים
  const [loading, setLoading] = useState(false);
  
  // בסיס שנבחר לרישום
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [availableBases, setAvailableBases] = useState<Base[]>([]);

  // תצוגת רישום/כניסה
  const [view, setView] = useState<'login' | 'register' | 'entry'>('entry');

  // שדות התחברות
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // שדות רישום
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [departmentId, setDepartmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  // שדות כניסה
  const [entryPersonalId, setEntryPersonalId] = useState('');
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [entryTrainee, setEntryTrainee] = useState<Trainee | null>(null);

  // טעינת רשימת הבסיסים בעת טעינת הדף
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const bases : [Base] = await baseService.getBases();
        setAvailableBases(bases);

        // אם המנהל הוא מנהל מכון, בחר את הבסיס שלו אוטומטית
        if (admin?.role === 'gymAdmin' && admin.baseId) {
          const adminBase = bases.find(b => b._id === admin.baseId);
          if (adminBase) {
            setSelectedBase(adminBase);
            // טען את המחלקות של הבסיס הנבחר
            fetchDepartments(adminBase._id);
          }
        }
      } catch (error) {
        console.error('Error fetching bases:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת רשימת הבסיסים",
          variant: "destructive"
        });
      }
    };

    fetchBases();
  }, [admin, toast]);

  // פונקציה לטעינת המחלקות של בסיס
  const fetchDepartments = async (baseId: string) => {
    try {
      const deps = await departmentService.getDepartments();
      // סנן רק מחלקות השייכות לבסיס שנבחר
      const filteredDeps = deps.filter((dep: Department) => dep._id === baseId);
      setDepartments(filteredDeps);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת רשימת המחלקות",
        variant: "destructive"
      });
    }
  };

  // בחירת בסיס
  const handleBaseSelection = (base: Base) => {
    setSelectedBase(base);
    fetchDepartments(base._id);
  };

  // הרשמת מתאמן חדש
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBase) {
      toast({
        title: "שגיאה",
        description: "יש לבחור בסיס",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // נתוני המתאמן החדש
      const traineeData = {
        personalId,
        fullName,
        medicalProfile,
        departmentId,
        phoneNumber,
        baseId: selectedBase._id
      };

      // ביצוע בקשת יצירת מתאמן חדש
      await traineeService.createTrainee(traineeData);

      // איפוס טופס ההרשמה
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setDepartmentId('');
      setPhoneNumber('');

      toast({
        title: "הרשמה הצליחה",
        description: "המתאמן נרשם בהצלחה למערכת"
      });
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        'אירעה שגיאה בעת הרשמת המתאמן';
      
      toast({
        title: "שגיאת הרשמה",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // בדיקת מספר אישי לרישום כניסה
  const handlePersonalIdCheck = async () => {
    if (!entryPersonalId) {
      toast({
        title: "שגיאה",
        description: "יש להזין מספר אישי",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // חיפוש המתאמן לפי מספר אישי
      const trainee = await traineeService.getTraineeByPersonalId(entryPersonalId);
      
      // בדיקה אם המתאמן שייך לבסיס הנבחר
      if (selectedBase && trainee.baseId._id !== selectedBase._id) {
        toast({
          title: "שגיאה",
          description: "המתאמן אינו רשום בבסיס זה",
          variant: "destructive"
        });
        return;
      }

      setEntryTrainee(trainee);
      setConfirmingEntry(true);
    } catch (error: any) {
      const errorMessage = 
        error.response?.status === 404
          ? 'המתאמן אינו רשום במערכת'
          : error.response?.data?.error || 'אירעה שגיאה בחיפוש המתאמן';
      
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // אישור כניסה למתאמן
  const handleEntryConfirmation = async () => {
    if (!entryTrainee || !selectedBase) return;

    setLoading(true);

    try {
      // בדיקה אם יש למתאמן אישור רפואי תקף
      if (!entryTrainee.medicalApproval.approved || 
          (entryTrainee.medicalApproval.expirationDate && 
           new Date(entryTrainee.medicalApproval.expirationDate) < new Date())) {
        toast({
          title: "אישור רפואי נדרש",
          description: "לא ניתן לרשום כניסה ללא אישור רפואי בתוקף",
          variant: "destructive"
        });
        setConfirmingEntry(false);
        setEntryTrainee(null);
        setEntryPersonalId('');
        setLoading(false);
        return;
      }

      // בדיקה אם כבר נרשמה כניסה למתאמן היום
      const today = new Date().toISOString().split('T')[0];
      const entryCheck = await entryService.checkEntry(entryTrainee._id, today);
      
      if (entryCheck.hasEntry) {
        toast({
          title: "כניסה כפולה",
          description: "כבר נרשמה כניסה למתאמן זה היום",
          variant: "destructive"
        });
        setConfirmingEntry(false);
        setEntryTrainee(null);
        setEntryPersonalId('');
        setLoading(false);
        return;
      }

      // יצירת רשומת כניסה חדשה
      const now = new Date();
      const entryData = {
        traineeId: entryTrainee._id,
        entryDate: today,
        entryTime: now.getHours().toString().padStart(2, '0') + ':' + 
                  now.getMinutes().toString().padStart(2, '0')
      };

      await entryService.createEntry(entryData);

      toast({
        title: "כניסה נרשמה בהצלחה",
        description: `${entryTrainee.fullName} נרשם/ה בהצלחה`
      });

      // איפוס הטופס
      setConfirmingEntry(false);
      setEntryTrainee(null);
      setEntryPersonalId('');
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        'אירעה שגיאה בעת רישום הכניסה';
      
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לניווט למסך התחברות מנהלים
  const handleAdminLoginNavigation = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">מערכת ניהול חדרי כושר</h1>
          <div className="flex items-center">
            <button onClick={handleAdminLoginNavigation} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
              התחברות מנהלים
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Base Selection for allBasesAdmin */}
          {(!selectedBase && availableBases.length > 0) && (
            <div className="glass p-8 rounded-2xl mb-8 animate-scale-in">
              <h2 className="text-2xl font-bold mb-6 text-center">בחר בסיס לרישום</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableBases.map(base => (
                  <button 
                    key={base._id} 
                    onClick={() => handleBaseSelection(base)} 
                    className="neomorphic p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                  >
                    <h3 className="text-xl font-semibold mb-2">{base.name}</h3>
                    <p className="text-muted-foreground">{base.location}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedBase && (
            <div className="space-y-8">
              {/* Base Info */}
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                  בסיס: {selectedBase.name}
                </span>
                <h2 className="text-3xl font-bold">מערכת רישום לחדר כושר</h2>
              </div>
              
              {/* Tabs */}
              <div className="flex justify-center space-x-4 border-b pb-4">
                <button 
                  onClick={() => setView('entry')} 
                  className={`px-6 py-2 rounded-md font-medium ${
                    view === 'entry' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  רישום כניסה
                </button>
                <button 
                  onClick={() => setView('register')} 
                  className={`px-6 py-2 rounded-md font-medium ${
                    view === 'register' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  הצטרפות למערכת
                </button>
              </div>
              
              {/* Registration Form */}
              {view === 'register' && (
                <div className="glass max-w-xl mx-auto p-8 rounded-2xl animate-fade-up">
                  <h3 className="text-xl font-bold mb-4 text-center">הצטרפות למערכת</h3>
                  <form onSubmit={handleRegistration} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="personalId" className="block text-sm font-medium">
                          מספר אישי (7 ספרות)
                        </label>
                        <input 
                          id="personalId" 
                          type="text" 
                          inputMode="numeric" 
                          value={personalId} 
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                            setPersonalId(value);
                          }} 
                          className="input-field" 
                          placeholder="1234567" 
                          required 
                          autoComplete="off" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="block text-sm font-medium">
                          שם מלא
                        </label>
                        <input 
                          id="fullName" 
                          type="text" 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)} 
                          className="input-field" 
                          placeholder="שם פרטי ומשפחה" 
                          required 
                          autoComplete="off" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="medicalProfile" className="block text-sm font-medium">
                          פרופיל רפואי
                        </label>
                        <select 
                          id="medicalProfile" 
                          value={medicalProfile} 
                          onChange={e => setMedicalProfile(e.target.value)} 
                          className="input-field" 
                          required
                        >
                          <option value="">בחר פרופיל</option>
                          <option value="97">97</option>
                          <option value="82">82</option>
                          <option value="72">72</option>
                          <option value="64">64</option>
                          <option value="45">45</option>
                          <option value="25">25</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="department" className="block text-sm font-medium">
                          מחלקה
                        </label>
                        <select 
                          id="department" 
                          value={departmentId} 
                          onChange={e => setDepartmentId(e.target.value)} 
                          className="input-field" 
                          required
                        >
                          <option value="">בחר מחלקה</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium">
                          מספר טלפון (10 ספרות, מתחיל ב-05)
                        </label>
                        <input 
                          id="phoneNumber" 
                          type="text" 
                          inputMode="numeric" 
                          value={phoneNumber} 
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhoneNumber(value);
                          }} 
                          className="input-field" 
                          placeholder="05XXXXXXXX" 
                          required 
                          autoComplete="off" 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md transition duration-300 hover:bg-primary/90 hover:shadow-lg"
                      disabled={loading}
                    >
                      {loading ? "טוען..." : "הצטרף"}
                    </Button>
                  </form>
                </div>
              )}
              
              {/* Entry Form */}
              {view === 'entry' && (
                <div className="glass max-w-xl mx-auto p-8 rounded-2xl animate-fade-up">
                  <h3 className="text-xl font-bold mb-4 text-center">רישום כניסה לחדר כושר</h3>
                  
                  {!confirmingEntry ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="entryPersonalId" className="block text-sm font-medium">
                          מספר אישי (7 ספרות)
                        </label>
                        <input 
                          id="entryPersonalId" 
                          type="text" 
                          inputMode="numeric" 
                          value={entryPersonalId} 
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                            setEntryPersonalId(value);
                          }} 
                          className="input-field" 
                          placeholder="1234567" 
                          required 
                          autoComplete="off" 
                        />
                      </div>
                      
                      <Button 
                        onClick={handlePersonalIdCheck} 
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md transition duration-300 hover:bg-primary/90 hover:shadow-lg"
                        disabled={loading}
                      >
                        {loading ? "טוען..." : "בדוק"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <p className="text-lg">האם שמך הוא</p>
                        <p className="text-2xl font-bold">{entryTrainee?.fullName}</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-secondary">
                        <h4 className="font-semibold text-lg mb-2">הצהרת בריאות</h4>
                        <p className="mb-2">אני מצהיר/ה בזאת כי:</p>
                        <ul className="list-inside space-y-1 text-sm">
                          <li className="flex items-start">
                            <span className="ml-2">•</span>
                            <span>המספר האישי והשם הנ"ל שייכים לי.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="ml-2">•</span>
                            <span>אני בריא/ה ואין לי מגבלות רפואיות המונעות ממני להתאמן בחדר כושר.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="ml-2">•</span>
                            <span>אני מודע/ת לכך שהשימוש במתקני חדר הכושר הינו באחריותי הבלעדית.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="ml-2">•</span>
                            <span>התייעצתי עם רופא לגבי פעילות גופנית אם יש לי בעיות בריאותיות.</span>
                          </li>
                        </ul>
                        <p className="mt-3 text-sm font-medium">לחיצה על כפתור "רישום כניסה" מהווה אישור של ההצהרה הרפואית למעלה</p>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button 
                          onClick={() => {
                            setConfirmingEntry(false);
                            setEntryTrainee(null);
                            setEntryPersonalId('');
                          }} 
                          variant="outline"
                          className="flex-1"
                          disabled={loading}
                        >
                          ביטול
                        </Button>
                        <Button 
                          onClick={handleEntryConfirmation} 
                          className="flex-1"
                          disabled={loading}
                        >
                          {loading ? "טוען..." : "רישום כניסה"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} מערכת ניהול חדרי כושר</p>
        </div>
      </footer>
    </div>
  );
};

export default Registration;