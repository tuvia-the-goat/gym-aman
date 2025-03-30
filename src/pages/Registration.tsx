import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Department, Base, Trainee } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { 
  baseService, 
  departmentService, 
  traineeService, 
  entryService, 
  authService 
} from '../services/api';
import { addMonths, parseISO, compareAsc } from 'date-fns';

const Registration = () => {
  const navigate = useNavigate();
  const { admin, bases, departments, trainees, setTrainees, entries, setEntries } = useAdmin();
  const { toast } = useToast();
  
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'entry'>('entry');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [departmentId, setDepartmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [entryPersonalId, setEntryPersonalId] = useState('');
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [entryTrainee, setEntryTrainee] = useState<Trainee | null>(null);
  const [medicalExpirationWarning, setMedicalExpirationWarning] = useState<boolean>(false);

  useEffect(() => {
    if (admin?.role && admin.baseId) {
      const base = bases.find(b => b._id === admin.baseId);
      if (base) {
        setSelectedBase(base);
      }
    } else if (admin?.role === 'generalAdmin' && bases.length > 0) {
      setSelectedBase(null);
    }
  }, [admin, bases]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const admin = await authService.login(loginUsername, loginPassword);
      navigate('/dashboard');
      toast({
        title: "התחברות הצליחה",
        description: `ברוך הבא, ${loginUsername}!`,
      });
    } catch (error) {
      toast({
        title: "התחברות נכשלה",
        description: "שם משתמש או סיסמה שגויים",
        variant: "destructive",
      });
    }
  };

  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
  };

  const validatePhoneNumber = (phone: string) => {
    return /^05\d{8}$/.test(phone);
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBase) {
      toast({
        title: "שגיאה",
        description: "יש לבחור בסיס",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePersonalId(personalId)) {
      toast({
        title: "שגיאה",
        description: "מספר אישי חייב להיות בדיוק 7 ספרות",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "שגיאה",
        description: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב-05",
        variant: "destructive",
      });
      return;
    }
    
    const existingTrainee = trainees.find(t => t.personalId === personalId);
    if (existingTrainee) {
      toast({
        title: "שגיאה",
        description: "מספר אישי כבר קיים במערכת",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newTrainee = await traineeService.create({
        personalId,
        fullName,
        medicalProfile: medicalProfile as '97' | '82' | '72' | '64' | '45' | '25',
        departmentId,
        phoneNumber,
        baseId: selectedBase._id
      });
      
      setTrainees([...trainees, newTrainee]);
      
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setDepartmentId('');
      setPhoneNumber('');
      
      toast({
        title: "הרשמה הצליחה",
        description: "המתאמן נרשם בהצלחה למערכת",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הרשמת המתאמן",
        variant: "destructive",
      });
      console.error('Registration error:', error);
    }
  };

  const handlePersonalIdCheck = () => {
    if (!validatePersonalId(entryPersonalId)) {
      toast({
        title: "שגיאה",
        description: "מספר אישי חייב להיות בדיוק 7 ספרות",
        variant: "destructive",
      });
      return;
    }
    
    const trainee = trainees.find(t => t.personalId === entryPersonalId);
    if (!trainee) {
      toast({
        title: "מתאמן לא נמצא",
        description: "המתאמן אינו רשום במערכת",
        variant: "destructive",
      });
      return;
    }
    
    setEntryTrainee(trainee);
    setConfirmingEntry(true);
  };

  const handleEntryConfirmation = async () => {
    if (!entryTrainee || !selectedBase) return;
    
    if (!entryTrainee.medicalApproval.approved || 
        (entryTrainee.medicalApproval.expirationDate && 
         new Date(entryTrainee.medicalApproval.expirationDate) < new Date())) {
      toast({
        title: "אישור רפואי נדרש",
        description: "לא ניתן לרשום כניסה ללא אישור רפואי בתוקף",
        variant: "destructive",
      });
      setConfirmingEntry(false);
      setEntryTrainee(null);
      setEntryPersonalId('');
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      const newEntry = await entryService.create({
        traineeId: entryTrainee._id,
        entryDate: today,
        entryTime: currentTime,
        traineeFullName: entryTrainee.fullName,
        traineePersonalId: entryTrainee.personalId,
        departmentId: entryTrainee.departmentId,
        baseId: entryTrainee.baseId
      });
      
      setEntries([newEntry, ...entries]);
      
      toast({
        title: "כניסה נרשמה בהצלחה",
        description: `${entryTrainee.fullName} נרשם/ה בהצלחה`,
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
        variant: "destructive",
      });
    } finally {
      setConfirmingEntry(false);
      setEntryTrainee(null);
      setEntryPersonalId('');
    }
  };

  const filteredDepartments = departments.filter(
    dept => selectedBase && dept.baseId === selectedBase._id
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground shadow-md px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">מערכת אימ"ון</h1>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              התחברות מנהלים
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {admin?.role === 'generalAdmin' && !selectedBase && (
            <div className="glass p-8 rounded-2xl mb-8 animate-scale-in">
              <h2 className="text-2xl font-bold mb-6 text-center">בחר בסיס לרישום</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bases.map((base) => (
                  <button
                    key={base._id}
                    onClick={() => setSelectedBase(base)}
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
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                  בסיס: {selectedBase.name}
                </span>
                <h2 className="text-3xl font-bold">מערכת רישום לחדר כושר</h2>
              </div>
              
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
              
              {view === 'login' && (
                <div className="glass max-w-md mx-auto p-8 rounded-2xl animate-fade-up">
                  <h3 className="text-xl font-bold mb-4 text-center">ט מנהלים</h3>
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="username" className="block text-sm font-medium">
                        שם משתמש
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="input-field"
                        placeholder="הזן שם משתמש"
                        required
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium">
                        סיסמה
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="input-field"
                        placeholder="הזן סיסמה"
                        required
                        autoComplete="off"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md
                      transition duration-300 hover:bg-primary/90 hover:shadow-lg"
                    >
                      התחבר
                    </button>
                  </form>
                </div>
              )}
              
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
                          onChange={(e) => {
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
                          onChange={(e) => setFullName(e.target.value)}
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
                          onChange={(e) => setMedicalProfile(e.target.value)}
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
                          onChange={(e) => setDepartmentId(e.target.value)}
                          className="input-field"
                          required
                        >
                          <option value="">בחר מחלקה</option>
                          {filteredDepartments.map((dept) => (
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
                          onChange={(e) => {
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
                    
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md
                      transition duration-300 hover:bg-primary/90 hover:shadow-lg"
                    >
                      הצטרף
                    </button>
                  </form>
                </div>
              )}
              
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
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                            setEntryPersonalId(value);
                          }}
                          className="input-field"
                          placeholder="1234567"
                          required
                          autoComplete="off"
                        />
                      </div>
                      
                      <button
                        onClick={handlePersonalIdCheck}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md
                        transition duration-300 hover:bg-primary/90 hover:shadow-lg"
                      >
                        בדוק
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <p className="text-lg">האם שמך הוא</p>
                        <p className="text-2xl font-bold">{entryTrainee?.fullName}?</p>
                        
                        {medicalExpirationWarning && (
                          <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md border border-red-200 font-medium">
                            שים לב: האישור הרפואי שלך יפוג בחודש הקרוב
                          </div>
                        )}
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
                        <button
                          onClick={() => {
                            setConfirmingEntry(false);
                            setEntryTrainee(null);
                            setEntryPersonalId('');
                            setMedicalExpirationWarning(false);
                          }}
                          className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium
                          transition duration-300 hover:bg-secondary/80"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={handleEntryConfirmation}
                          className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md
                          transition duration-300 hover:bg-primary/90 hover:shadow-lg"
                        >
                          רישום כניסה
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()}  מערכת אימ"ון </p>
        </div>
      </footer>
    </div>
  );
};

export default Registration;
