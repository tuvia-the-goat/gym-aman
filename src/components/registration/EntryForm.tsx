
import React, { useState } from 'react';
import { Trainee, Entry } from '../../types';
import { entryService } from '../../services/api';
import { useToast } from '@/hooks/use-toast';
import { addMonths, parseISO, compareAsc } from 'date-fns';

interface EntryFormProps {
  trainees: Trainee[];
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
}

const EntryForm = ({ trainees, entries, setEntries }: EntryFormProps) => {
  const { toast } = useToast();
  const [entryPersonalId, setEntryPersonalId] = useState('');
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [entryTrainee, setEntryTrainee] = useState<Trainee | null>(null);
  const [medicalExpirationWarning, setMedicalExpirationWarning] = useState<boolean>(false);

  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
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
    
    if (trainee.medicalApproval.approved && trainee.medicalApproval.expirationDate) {
      const expirationDate = parseISO(trainee.medicalApproval.expirationDate);
      const oneMonthFromNow = addMonths(new Date(), 1);
      
      if (compareAsc(expirationDate, new Date()) > 0 && compareAsc(expirationDate, oneMonthFromNow) < 0) {
        setMedicalExpirationWarning(true);
      } else {
        setMedicalExpirationWarning(false);
      }
    } else {
      setMedicalExpirationWarning(false);
    }
  };

  const handleEntryConfirmation = async () => {
    if (!entryTrainee) return;
    
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
      setMedicalExpirationWarning(false);
    }
  };

  const cancelConfirmation = () => {
    setConfirmingEntry(false);
    setEntryTrainee(null);
    setEntryPersonalId('');
    setMedicalExpirationWarning(false);
  };

  return (
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
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 font-medium">
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>שים לב: האישור הרפואי שלך יפוג בחודש הקרוב</span>
                </p>
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
          
          {medicalExpirationWarning && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 font-medium">
              <p className="text-center">נא לחדש את האישור הרפואי שלך בהקדם האפשרי</p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={cancelConfirmation}
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
  );
};

export default EntryForm;
