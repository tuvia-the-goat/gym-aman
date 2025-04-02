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
import { addMonths, compareAsc, parseISO } from 'date-fns';

const TraineeEntering = () => {
  const navigate = useNavigate();
  const { admin, bases, departments, trainees, setTrainees, entries, setEntries } = useAdmin();
  const { toast } = useToast();
  
  // Selected base for registration
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  
  // Login/Registration view state
  const [view, setView] = useState<'login' | 'register' | 'entry'>('entry');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration fields
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [departmentId, setDepartmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Entry fields
  const [entryPersonalId, setEntryPersonalId] = useState('');
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [entryTrainee, setEntryTrainee] = useState<Trainee | null>(null);
  const [traineeMedicalExpirationDate, setTraineeMedicalExpirationDate] = useState<Date | null>(null);
  
  // Initialize the selected base based on the admin role
  useEffect(() => {
    if (admin?.role && admin.baseId) {
      const base = bases.find(b => b._id === admin.baseId);
      if (base) {
        setSelectedBase(base);
      }
    } else if (admin?.role === 'generalAdmin' && bases.length > 0) {
      setSelectedBase(null); // Require selection for allBasesAdmin
    }
  }, [admin, bases]);
  
  useEffect(() => {
    // Replace the current history state to prevent going back
    window.history.pushState(null, '', window.location.pathname);
    
    // Add event listener to handle any attempt to go back
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Login using API service
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
  
  // Validate personal ID (7 digits)
  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
  };
  
  // Validate phone number (10 digits starting with 05)
  const validatePhoneNumber = (phone: string) => {
    return /^05\d{8}$/.test(phone);
  };
  
  // Handle trainee registration
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
    
    // Validate inputs
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
    
    // Check if personal ID already exists
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
      // Create new trainee via API
      const newTrainee = await traineeService.create({
        personalId,
        fullName,
        medicalProfile: medicalProfile as '97' | '82' | '72' | '64' | '45' | '25',
        departmentId,
        phoneNumber,
        baseId: selectedBase._id
      });
      
      // Update state with new trainee
      setTrainees([...trainees, newTrainee]);
      
      // Reset form
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
  
  const getDateFormat = (dateToFormat : Date) => {
    const day = dateToFormat.getDate();        // Day (1-31)
    const month = dateToFormat.getMonth() + 1; // Month (0-11, so add 1)
    const year = dateToFormat.getFullYear();   // Full year (e.g., 2025)
    return(`${day}/${month}/${year}`)
  }

  // Handle personal ID check for entry
  const handlePersonalIdCheck = () => {
    if (!validatePersonalId(entryPersonalId)) {
      toast({
        title: "שגיאה",
        description: "מספר אישי חייב להיות בדיוק 7 ספרות",
        variant: "destructive",
      });
      return;
    }
    
    // Find trainee by personal ID
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
    setTraineeMedicalExpirationDate(new Date(trainee.medicalApproval.expirationDate))
    setConfirmingEntry(true);
  };

  const isMedicalAboutToExpire = () => {
    const oneMonthFromNow = addMonths(new Date(), 1);
    return compareAsc(traineeMedicalExpirationDate, new Date()) >= 0 && compareAsc(traineeMedicalExpirationDate, oneMonthFromNow) <= 0;
  }
  
  // Handle entry confirmation
  const handleEntryConfirmation = async () => {
    if (!entryTrainee || !selectedBase) return;
    
    // Check if medical approval is valid
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
      // Today's date in format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      // Create entry via API
      const newEntry = await entryService.create({
        traineeId: entryTrainee._id,
        entryDate: today,
        entryTime: currentTime,
        traineeFullName: entryTrainee.fullName,
        traineePersonalId: entryTrainee.personalId,
        departmentId: entryTrainee.departmentId,
        baseId: entryTrainee.baseId
      });
      
      // Update state with new entry
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
      // Reset form
      setConfirmingEntry(false);
      setEntryTrainee(null);
      setEntryPersonalId('');
    }
  };
  
  // Filter departments by selected base
  const filteredDepartments = departments.filter(
    dept => selectedBase && dept.baseId === selectedBase._id
  );


  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
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

      {/* Main content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Base Selection for allBasesAdmin */}
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
              {/* Base Info */}
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                  בסיס: {selectedBase.name}
                </span>
                <h2 className="text-3xl font-bold">מערכת רישום לחדר כושר</h2>
              </div>
            
              
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
                      
                      { isMedicalAboutToExpire() && 
                      <div className='w-full border-2 border-[rgb(255,141,141)] bg-[rgba(255,141,141,0.44)] text-[rgb(255,141,141)] font-bold text-center p-3 rounded-[8px]'>
                        שימ/י לב! תוקף האישור הרפואי שלך יפוג ב-
                      {getDateFormat(traineeMedicalExpirationDate)}
                      , יש לחדש אותו בהקדם בברקוד הייעודי ולעדכן את צוות חדר הכושר.

                      </div>
                      }
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setConfirmingEntry(false);
                            setEntryTrainee(null);
                            setEntryPersonalId('');
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

      {/* Footer */}
      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()}  מערכת אימ"ון </p>
        </div>
      </footer>
    </div>
  );
};

export default TraineeEntering;