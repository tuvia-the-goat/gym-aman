import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Department, Base, Trainee, MedicalFormScore, EntryStatus } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { 
  baseService, 
  departmentService, 
  traineeService, 
  entryService, 
  authService 
} from '../services/api';
import { addMonths, compareAsc, parseISO, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  AlertCircle, 
  User, 
  Calendar as CalendarIconFull, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Dumbbell, 
  LogIn
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import TraineeProfile from '../components/TraineeProfile';

const TraineeEntering = () => {
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
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [orthopedicCondition, setOrthopedicCondition] = useState(false);
  const [entryPersonalId, setEntryPersonalId] = useState('');
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [entryTrainee, setEntryTrainee] = useState<Trainee | null>(null);
  const [traineeMedicalExpirationDate, setTraineeMedicalExpirationDate] = useState<Date | null>(null);

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
    if (!birthDate) {
      toast({
        title: "שגיאה",
        description: "חובה להזין תאריך לידה",
        variant: "destructive",
      });
      return;
    }
    if (!gender) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מין",
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
      const formattedBirthDate = birthDate.toISOString().split('T')[0];
      const newTrainee = await traineeService.create({
        personalId,
        fullName,
        medicalProfile: medicalProfile as '97' | '82' | '72' | '64' | '45' | '25',
        departmentId,
        phoneNumber,
        baseId: selectedBase._id,
        gender: gender as 'male' | 'female',
        birthDate: formattedBirthDate,
        orthopedicCondition,
        medicalFormScore: 'notRequired' as MedicalFormScore
      });
      setTrainees([...trainees, newTrainee]);
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setDepartmentId('');
      setPhoneNumber('');
      setGender('');
      setBirthDate(undefined);
      setOrthopedicCondition(false);
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
    const day = dateToFormat.getDate();
    const month = dateToFormat.getMonth() + 1;
    const year = dateToFormat.getFullYear();
    return(`${day}/${month}/${year}`)
  }

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
      handleNotRegisteredEntry();
      return;
    }
    setEntryTrainee(trainee);
    setTraineeMedicalExpirationDate(trainee.medicalApproval.expirationDate ? new Date(trainee.medicalApproval.expirationDate) : null);
    setConfirmingEntry(true);
  };

  const handleNotRegisteredEntry = async () => {
    if (!selectedBase) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];
      const newEntry = await entryService.createNonRegistered({
        entryDate: today,
        entryTime: currentTime,
        traineePersonalId: entryPersonalId,
        baseId: selectedBase._id,
        status: 'notRegistered'
      });
      console.log("fewefef");
      
      setEntries([newEntry, ...entries]);
      toast({
        title: "משתמש לא רשום",
        description: "נרשמה כניסה למשתמש לא רשום. יש לבצע רישום למערכת.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
        variant: "destructive",
      });
    } finally {
      setEntryPersonalId('');
    }
  };

  const isMedicalAboutToExpire = () => {
    if (!traineeMedicalExpirationDate) return false;
    const oneMonthFromNow = addMonths(new Date(), 1);
    return compareAsc(traineeMedicalExpirationDate, new Date()) >= 0 && compareAsc(traineeMedicalExpirationDate, oneMonthFromNow) <= 0;
  }

  const handleEntryConfirmation = async () => {
    if (!entryTrainee || !selectedBase) return;
    
    const isMedicalApprovalValid = 
      entryTrainee.medicalApproval.approved && 
      (!entryTrainee.medicalApproval.expirationDate || 
       new Date(entryTrainee.medicalApproval.expirationDate) >= new Date());
    
    if (!isMedicalApprovalValid) {
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
          baseId: entryTrainee.baseId,
          status: 'noMedicalApproval'
        });
        
        setEntries([newEntry, ...entries]);
        toast({
          title: "אישור רפואי נדרש",
          description: "לא ניתן לרשום כניסה ללא אישור רפואי בתוקף",
          variant: "destructive",
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
        baseId: entryTrainee.baseId,
        status: 'success'
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/50 to-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Dumbbell className="h-6 w-6" />
            <h1 className="text-2xl font-bold">מערכת אימ"ון</h1>
          </div>
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogIn className="ml-2 h-4 w-4" />
            התחברות מנהלים
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
        <div className="max-w-4xl mx-auto">
          {admin?.role === 'generalAdmin' && !selectedBase && (
            <div className="glass p-8 rounded-2xl mb-8 animate-scale-in">
              <h2 className="text-2xl font-bold mb-6 text-center">בחר בסיס לרישום</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bases.map((base) => (
                  <button
                    key={base._id}
                    onClick={() => setSelectedBase(base)}
                    className="bg-card hover:bg-card/80 p-6 rounded-xl text-center hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg border border-border/30"
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
                <h2 className="text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">מערכת רישום לחדר כושר</h2>
                <div className="flex justify-center mt-6 gap-4">
                  <Button 
                    variant={view === 'entry' ? "default" : "outline"}
                    onClick={() => setView('entry')}
                    className="flex-1 max-w-48"
                  >
                    <LogIn className="ml-2 h-4 w-4" />
                    רישום כניסה
                  </Button>
                  <Button 
                    variant={view === 'register' ? "default" : "outline"}
                    onClick={() => setView('register')}
                    className="flex-1 max-w-48"
                  >
                    <User className="ml-2 h-4 w-4" />
                    הצטרפות למערכת
                  </Button>
                </div>
              </div>
              
              {view === 'register' && (
                <div className="glass max-w-xl mx-auto p-6 rounded-2xl animate-fade-up shadow-lg border border-border/30">
                  <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    הצטרפות למערכת
                  </h3>
                  <form onSubmit={handleRegistration} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="personalId" className="block text-sm font-medium">
                          מספר אישי (7 ספרות)
                        </label>
                        <Input
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
                        <Input
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
                        <label htmlFor="gender" className="block text-sm font-medium">
                          מין
                        </label>
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                          className="input-field w-full px-3 py-2 rounded-md border border-input"
                          required
                        >
                          <option value="">בחר מין</option>
                          <option value="male">זכר</option>
                          <option value="female">נקבה</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="birthDate" className="block text-sm font-medium">
                          תאריך לידה
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="birthDate"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-right",
                                !birthDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {birthDate ? format(birthDate, "yyyy-MM-dd") : "בחר תאריך"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={birthDate}
                              onSelect={setBirthDate}
                              initialFocus
                              disabled={(date) => {
                                return date > new Date();
                              }}
                              className={cn("p-3 pointer-events-auto")}
                              fromYear={1940}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="medicalProfile" className="block text-sm font-medium">
                          פרופיל רפואי
                        </label>
                        <select
                          id="medicalProfile"
                          value={medicalProfile}
                          onChange={(e) => setMedicalProfile(e.target.value)}
                          className="input-field w-full px-3 py-2 rounded-md border border-input"
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
                          className="input-field w-full px-3 py-2 rounded-md border border-input"
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
                      
                      <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium">
                          מספר טלפון (מתחיל ב-05)
                        </label>
                        <Input
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
                      
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            id="orthopedicCondition"
                            type="checkbox"
                            checked={orthopedicCondition}
                            onChange={(e) => setOrthopedicCondition(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="orthopedicCondition" className="text-sm font-medium">
                            סעיף פרופיל אורטופדי
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                    >
                      הצטרף
                    </Button>
                  </form>
                </div>
              )}
              
              {view === 'entry' && (
                <div className="glass max-w-xl mx-auto p-6 rounded-2xl animate-fade-up shadow-lg border border-border/30">
                  <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center">
                    <LogIn className="mr-2 h-5 w-5 text-primary" />
                    רישום כניסה לחדר כושר
                  </h3>
                  
                  {!confirmingEntry ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="entryPersonalId" className="block text-sm font-medium">
                          מספר אישי (7 ספרות)
                        </label>
                        <div className="relative">
                          <Input
                            id="entryPersonalId"
                            type="text"
                            inputMode="numeric"
                            value={entryPersonalId}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                              setEntryPersonalId(value);
                            }}
                            className="input-field pr-10"
                            placeholder="1234567"
                            required
                            autoComplete="off"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handlePersonalIdCheck}
                        className="w-full"
                        size="lg"
                      >
                        בדוק
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {entryTrainee && (
                        <>
                          <div className="text-center mb-6">
                            <div className="inline-flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 mb-3">
                              <User className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-lg">האם שמך הוא</p>
                            <p className="text-2xl font-bold">{entryTrainee?.fullName}?</p>
                          </div>
                          
                          <div className="p-5 rounded-lg bg-card border border-border">
                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                              <Shield className="h-5 w-5 ml-2 text-primary" />
                              הצהרת בריאות
                            </h4>
                            <p className="mb-3">אני מצהיר/ה בזאת כי:</p>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>המספר האישי והשם הנ"ל שייכים לי.</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>אני בריא/ה ואין לי מגבלות רפואיות המונעות ממני להתאמן בחדר כושר.</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>אני מודע/ת לכך שהשימוש במתקני חדר הכושר הינו באחריותי הבלעדית.</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>התייעצתי עם רופא לגבי פעילות גופנית אם יש לי בעיות בריאותיות.</span>
                              </li>
                            </ul>
                            <p className="mt-3 text-sm font-medium text-primary">לחיצה על כפתור "רישום כניסה" מהווה אישור של ההצהרה הרפואית למעלה</p>
                          </div>
                          
                          {isMedicalAboutToExpire() && entryTrainee.medicalApproval.approved && (
                            <div className="p-4 border-2 border-amber-400 bg-amber-50 rounded-lg flex items-start">
                              <AlertCircle className="h-5 w-5 text-amber-500 mr-1 ml-2 shrink-0 mt-0.5" />
                              <div className="text-amber-800">
                                <p className="font-semibold">שימ/י לב! תוקף האישור הרפואי שלך יפוג ב-
                                {getDateFormat(traineeMedicalExpirationDate!)}
                                </p>
                                <p className="text-sm">יש לחדש אותו בהקדם בברקוד הייעודי ולעדכן את צוות חדר הכושר.</p>
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-4 gap-4 mt-4">
                            <Button
                              onClick={() => {
                                setConfirmingEntry(false);
                                setEntryTrainee(null);
                                setEntryPersonalId('');
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              <XCircle className="ml-2 h-4 w-4" />
                              ביטול
                            </Button>
                            <Button
                              onClick={handleEntryConfirmation}
                              className="flex-1"
                            >
                              <CheckCircle className="ml-2 h-4 w-4" />
                              רישום כניסה
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-background border-t py-6 mt-auto">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} מערכת אימ"ון</p>
        </div>
      </footer>
    </div>
  );
};

export default TraineeEntering;
