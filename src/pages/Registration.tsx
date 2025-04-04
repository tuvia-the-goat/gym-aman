
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { PrimaryFramework, SecondaryFramework, Base, Trainee } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { 
  baseService, 
  primaryFrameworkService,
  secondaryFrameworkService,
  traineeService, 
  entryService, 
  authService 
} from '../services/api';
import { addMonths, compareAsc, parseISO } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';

const Registration = () => {
  const navigate = useNavigate();
  const { 
    admin, 
    bases, 
    primaryFrameworks, 
    secondaryFrameworks, 
    trainees, 
    setTrainees, 
    entries, 
    setEntries 
  } = useAdmin();
  const { toast } = useToast();
  
  // Selected base for registration
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  
  // Registration fields
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [primaryFrameworkId, setPrimaryFrameworkId] = useState('');
  const [secondaryFrameworkId, setSecondaryFrameworkId] = useState('');
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
  
  // Reset secondary framework when primary framework changes
  useEffect(() => {
    setSecondaryFrameworkId('');
  }, [primaryFrameworkId]);
  
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
        primaryFrameworkId,
        secondaryFrameworkId,
        phoneNumber,
        baseId: selectedBase._id
      });
      
      // Update state with new trainee
      setTrainees([...trainees, newTrainee]);
      
      // Reset form
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setPrimaryFrameworkId('');
      setSecondaryFrameworkId('');
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
        primaryFrameworkId: entryTrainee.primaryFrameworkId,
        secondaryFrameworkId: entryTrainee.secondaryFrameworkId,
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
  
  // Filter primary frameworks by selected base
  const filteredPrimaryFrameworks = primaryFrameworks.filter(
    framework => selectedBase && framework.baseId === selectedBase._id
  );
  
  // Filter secondary frameworks by selected primary framework
  const filteredSecondaryFrameworks = secondaryFrameworks.filter(
    framework => framework.primaryFrameworkId === primaryFrameworkId
  );
  
  // Handle creation of a new primary framework
  const handleAddPrimaryFramework = async () => {
    if (!selectedBase) return;
    
    const frameworkName = prompt("הזן שם למסגרת ראשית חדשה:");
    if (!frameworkName || frameworkName.trim() === "") return;
    
    try {
      const newFramework = await primaryFrameworkService.create({
        name: frameworkName.trim(),
        baseId: selectedBase._id
      });
      
      toast({
        title: "מסגרת ראשית נוספה בהצלחה",
        description: `${frameworkName} נוסף/ה בהצלחה`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המסגרת הראשית",
        variant: "destructive",
      });
    }
  };
  
  // Handle creation of a new secondary framework
  const handleAddSecondaryFramework = async () => {
    if (!selectedBase || !primaryFrameworkId) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מסגרת ראשית תחילה",
        variant: "destructive",
      });
      return;
    }
    
    const frameworkName = prompt("הזן שם למסגרת משנית חדשה:");
    if (!frameworkName || frameworkName.trim() === "") return;
    
    try {
      const newFramework = await secondaryFrameworkService.create({
        name: frameworkName.trim(),
        primaryFrameworkId,
        baseId: selectedBase._id
      });
      
      toast({
        title: "מסגרת משנית נוספה בהצלחה",
        description: `${frameworkName} נוסף/ה בהצלחה`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המסגרת המשנית",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout activeTab="registration">
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
                <h2 className="text-3xl font-bold">רישום מתאמנים</h2>
              </div>
              
              {/* Framework Management */}
              <div className="glass max-w-xl mx-auto p-8 rounded-2xl animate-fade-up">
                <h3 className="text-xl font-bold mb-4 text-center">ניהול מסגרות</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">מסגרות ראשיות</h4>
                    <button 
                      onClick={handleAddPrimaryFramework}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm hover:bg-primary/30 transition-colors"
                    >
                      הוסף מסגרת ראשית
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">מסגרות משניות</h4>
                    <button 
                      onClick={handleAddSecondaryFramework}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm hover:bg-primary/30 transition-colors"
                      disabled={!primaryFrameworkId}
                    >
                      הוסף מסגרת משנית
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Registration Form */}
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
                        <label htmlFor="primaryFramework" className="block text-sm font-medium">
                          מסגרת ראשית
                        </label>
                        <select
                          id="primaryFramework"
                          value={primaryFrameworkId}
                          onChange={(e) => setPrimaryFrameworkId(e.target.value)}
                          className="input-field"
                          required
                        >
                          <option value="">בחר מסגרת ראשית</option>
                          {filteredPrimaryFrameworks.map((framework) => (
                            <option key={framework._id} value={framework._id}>
                              {framework.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="secondaryFramework" className="block text-sm font-medium">
                          מסגרת משנית
                        </label>
                        <select
                          id="secondaryFramework"
                          value={secondaryFrameworkId}
                          onChange={(e) => setSecondaryFrameworkId(e.target.value)}
                          className="input-field"
                          required
                          disabled={!primaryFrameworkId}
                        >
                          <option value="">בחר מסגרת משנית</option>
                          {filteredSecondaryFrameworks.map((framework) => (
                            <option key={framework._id} value={framework._id}>
                              {framework.name}
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
            </div>
          )}
        </div>
    </DashboardLayout>
  );
};

export default Registration;
