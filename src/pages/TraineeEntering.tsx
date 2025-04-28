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
      setEntries([newEntry, ...entries]);
      toast({
        title: "משתמש לא רשום",
        description:'נרשמה כניסה למשתמש לא רשום. יש לבצע רישום למערכת אצל המד"ג/ית.',
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
          subDepartmentId: entryTrainee.subDepartmentId,
          baseId: selectedBase._id,
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
        subDepartmentId: entryTrainee.subDepartmentId,
        baseId: selectedBase._id,
        status: 'success'
      });
      setEntries([newEntry, ...entries]);
      toast({
        title: "כניסה נרשמה בהצלחה",
        description: `${entryTrainee.fullName} נרשם/ה בהצלחה`,
        variant: "successful"
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
            className="text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/10"
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
            <div className="space-y-3">
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-1">
                  בסיס: {selectedBase.name}
                </span>
              </div>
              
              
              
              {view === 'entry' && (
                <div className="glass max-w-xl mx-auto p-6 rounded-2xl animate-fade-up shadow-lg border border-border/30">
                  <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center">
                    <LogIn className="ml-2 h-5 w-5 text-primary" />
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
                            placeholder="הזן את מספרך האישי"
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
                              הצהרת כשירות לאימון בחדר כושר
                            </h4>
                            <p className="mb-3">אני מצהיר/ה בזאת כי:</p>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>המספר האישי והשם הנ"ל שייכים לי.</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>בחתימתי הנני מתחייב <b>שקראתי את התדריך למתאמן ואעמוד בו.</b></span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>הנני כשיר לאימון כולל תרגילי כוח ופעילות אירובית.<b> לא ידוע לי בעיה רפואית ממנה אני סובל </b>כגון בעיות לב,
לחץ דם, סכרת, עודף שומנים בדם, כאבים בגזה, התעלפויות, הפרעה בשיווי משקל, סחרחורות, דופק מואץ, קוצר
נשימה, צפצופים בנשימה, אסתמה או אירוע חריג אחר.<b> כמו כן, אינני נוטל תרופות או סובל ממחלות כרוניות
 </b> הפוגעות ביכולתי להתאמן.  </span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>בכל מקרה של הופעת הסימנים הבאים- כאב או לחץ בחזה, ביד או בלסת, קוצר נשימה, תחושת עילפון,
                                סחרחורת- אפסיק את האימון באופן מידי ואפנה להתייעצות רפואית.</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 ml-2 mt-0.5 text-primary shrink-0" />
                                <span>בחתימתי בכניסה לחד"כ אני מצהירה כי <b>נמצא בידיי אישור רופא לביצוע פ"ג ואני כשיר לבצע אימון</b> בחדר כושר.
                                </span>
                              </li>
                              <li className="flex items-start">
                              <b>מתאמן- גלה אחריות למצבך הרפואי והימנע מסיכון בריאותי!</b>
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
